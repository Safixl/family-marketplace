package com.familymarket.seasonal;

import com.familymarket.child.ChildRepository;
import com.familymarket.common.NotFoundException;
import com.familymarket.dto.SeasonalEventDto;
import com.familymarket.dto.SeasonalEventUpsertRequest;
import com.familymarket.store.Store;
import com.familymarket.store.StoreRepository;
import com.familymarket.user.User;
import com.familymarket.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

/**
 * Сезонные ивенты: магазин открыт ограниченное время, валюта — сезонные жетоны.
 * При создании ивента автоматически создаётся сезонный магазин с валютой-жетонами.
 * Жетоны зарабатываются ТОЛЬКО через сезонные квесты ГМа (одобрение заявки начисляет валюту магазина).
 * <p>
 * После окончания ивента:
 * <ul>
 *   <li>{@code keepAfterEnd = false} — ивент, магазин, товары и валюта удаляются полностью;</li>
 *   <li>{@code keepAfterEnd = true} — ивент остаётся у родителя, магазин деактивируется и
 *       скрывается от ребёнка; при повторном запуске (новые даты) магазин снова открывается.</li>
 * </ul>
 */
@Service
public class SeasonalService {

    private static final ZoneId ZONE = ZoneId.of("Europe/Moscow");

    private final SeasonalEventRepository eventRepository;
    private final StoreRepository storeRepository;
    private final UserRepository userRepository;
    private final ChildRepository childRepository;

    public SeasonalService(SeasonalEventRepository eventRepository,
                           StoreRepository storeRepository,
                           UserRepository userRepository,
                           ChildRepository childRepository) {
        this.eventRepository = eventRepository;
        this.storeRepository = storeRepository;
        this.userRepository = userRepository;
        this.childRepository = childRepository;
    }

    @Transactional
    public List<SeasonalEventDto> listForParent(Long parentId) {
        closeExpiredInternal();
        return eventRepository.findByParentIdOrderByStartsAtDesc(parentId)
                .stream()
                .map(e -> SeasonalEventDto.from(e, storeId(e.getId())))
                .toList();
    }

    @Transactional
    public List<SeasonalEventDto> listOpenForChild(Long childId) {
        Long parentId = childRepository.findParentIdById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        closeExpiredInternal();
        return listOpenForParent(parentId);
    }

    private List<SeasonalEventDto> listOpenForParent(Long parentId) {
        return eventRepository.findOpenForParent(parentId, LocalDate.now(ZONE))
                .stream()
                .map(e -> SeasonalEventDto.from(e, storeId(e.getId())))
                .toList();
    }

    @Transactional
    public SeasonalEventDto create(Long parentId, SeasonalEventUpsertRequest request) {
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));
        SeasonalEvent event = new SeasonalEvent();
        event.setParent(parent);
        applyRequest(event, request);
        event.setCreatedAt(Instant.now());
        event = eventRepository.save(event);

        Store store = syncStore(event);
        return SeasonalEventDto.from(event, store.getId());
    }

    @Transactional
    public SeasonalEventDto update(Long parentId, Long eventId, SeasonalEventUpsertRequest request) {
        SeasonalEvent event = getOwned(parentId, eventId);
        applyRequest(event, request);
        SeasonalEvent saved = eventRepository.save(event);
        // Повторный запуск: если магазин был скрыт после окончания, он снова станет доступен.
        Store store = syncStore(saved);
        return SeasonalEventDto.from(saved, store.getId());
    }

    @Transactional
    public void delete(Long parentId, Long eventId) {
        SeasonalEvent event = getOwned(parentId, eventId);
        storeRepository.findByParentIdAndSeasonalEventIdOrderByCreatedAtAsc(parentId, eventId)
                .forEach(storeRepository::delete);
        eventRepository.delete(event);
    }

    /**
     * Закрывает завершившиеся ивенты. Вызывается планировщиком в 00:05 МСК
     * и лениво при открытии списка ивентов.
     */
    @Transactional
    public void closeExpired() {
        closeExpiredInternal();
    }

    private void closeExpiredInternal() {
        LocalDate today = LocalDate.now(ZONE);
        for (SeasonalEvent event : eventRepository.findEndedBefore(today)) {
            List<Store> stores = storeRepository.findByParentIdAndSeasonalEventIdOrderByCreatedAtAsc(
                    event.getParent().getId(), event.getId());
            if (event.isKeepAfterEnd()) {
                for (Store store : stores) {
                    if (store.isActive()) {
                        store.setActive(false);
                        storeRepository.save(store);
                    }
                }
            } else {
                stores.forEach(storeRepository::delete);
                eventRepository.delete(event);
            }
        }
    }

    private Long storeId(Long eventId) {
        return storeRepository.findFirstBySeasonalEventId(eventId)
                .map(Store::getId)
                .orElse(null);
    }

    /**
     * Создаёт или обновляет сезонный магазин под текущие параметры ивента.
     * Магазин активен только пока ивент открыт (даты + ручной флаг active).
     */
    private Store syncStore(SeasonalEvent event) {
        Store store = storeRepository.findFirstBySeasonalEventId(event.getId()).orElseGet(() -> {
            Store created = new Store();
            created.setParent(event.getParent());
            created.setSeasonalEvent(event);
            created.setCreatedAt(Instant.now());
            return created;
        });
        store.setName(event.getName());
        store.setDescription(event.getDescription());
        store.setCurrencyName(event.getTokenName());
        store.setCurrencyIcon(event.getTokenIcon());
        store.setActive(event.isOpenNow());
        return storeRepository.save(store);
    }

    private void applyRequest(SeasonalEvent event, SeasonalEventUpsertRequest request) {
        if (request.name() != null) {
            event.setName(request.name().trim());
        }
        if (request.description() != null) {
            event.setDescription(request.description());
        }
        if (request.tokenName() != null && !request.tokenName().isBlank()) {
            event.setTokenName(request.tokenName().trim());
        }
        if (request.tokenIcon() != null && !request.tokenIcon().isBlank()) {
            event.setTokenIcon(request.tokenIcon().trim());
        }
        if (request.startsAt() != null) {
            event.setStartsAt(request.startsAt());
        }
        if (request.endsAt() != null) {
            event.setEndsAt(request.endsAt());
        }
        if (request.active() != null) {
            event.setActive(request.active());
        }
        if (request.keepAfterEnd() != null) {
            event.setKeepAfterEnd(request.keepAfterEnd());
        }
    }

    private SeasonalEvent getOwned(Long parentId, Long eventId) {
        return eventRepository.findById(eventId)
                .filter(e -> e.getParent().getId().equals(parentId))
                .orElseThrow(() -> new NotFoundException("Ивент не найден"));
    }
}
