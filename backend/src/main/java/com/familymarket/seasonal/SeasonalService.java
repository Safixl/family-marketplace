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
import java.util.List;

/**
 * Сезонные ивенты: магазин открыт ограниченное время, валюта — сезонные жетоны.
 * При создании ивента автоматически создаётся сезонный магазин с валютой-жетонами.
 * Жетоны зарабатываются ТОЛЬКО через сезонные квесты ГМа (одобрение заявки начисляет валюту магазина).
 */
@Service
public class SeasonalService {

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

    @Transactional(readOnly = true)
    public List<SeasonalEventDto> listForParent(Long parentId) {
        return eventRepository.findByParentIdOrderByStartsAtDesc(parentId)
                .stream().map(SeasonalEventDto::from).toList();
    }

    @Transactional(readOnly = true)
    public List<SeasonalEventDto> listOpenForChild(Long childId) {
        Long parentId = childRepository.findParentIdById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        return listOpenForParent(parentId);
    }

    private List<SeasonalEventDto> listOpenForParent(Long parentId) {
        return eventRepository.findOpenForParent(parentId, LocalDate.now())
                .stream().map(SeasonalEventDto::from).toList();
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

        // Сезонный магазин с валютой-жетонами (автоматически)
        Store store = new Store();
        store.setParent(parent);
        store.setName(event.getName());
        store.setDescription(event.getDescription());
        store.setCurrencyName(event.getTokenName());
        store.setCurrencyIcon(event.getTokenIcon());
        store.setActive(true);
        store.setSeasonalEvent(event);
        store.setCreatedAt(Instant.now());
        storeRepository.save(store);
        return SeasonalEventDto.from(event);
    }

    @Transactional
    public SeasonalEventDto update(Long parentId, Long eventId, SeasonalEventUpsertRequest request) {
        SeasonalEvent event = getOwned(parentId, eventId);
        applyRequest(event, request);
        return SeasonalEventDto.from(eventRepository.save(event));
    }

    @Transactional
    public void delete(Long parentId, Long eventId) {
        SeasonalEvent event = getOwned(parentId, eventId);
        storeRepository.findByParentIdAndSeasonalEventIdOrderByCreatedAtAsc(parentId, eventId)
                .forEach(storeRepository::delete);
        eventRepository.delete(event);
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
    }

    private SeasonalEvent getOwned(Long parentId, Long eventId) {
        return eventRepository.findById(eventId)
                .filter(e -> e.getParent().getId().equals(parentId))
                .orElseThrow(() -> new NotFoundException("Ивент не найден"));
    }
}
