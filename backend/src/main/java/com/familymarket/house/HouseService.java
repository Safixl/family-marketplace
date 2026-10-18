package com.familymarket.house;

import com.familymarket.achievement.AchievementService;
import com.familymarket.balance.BalanceService;
import com.familymarket.child.Child;
import com.familymarket.child.ChildRepository;
import com.familymarket.common.BadRequestException;
import com.familymarket.common.NotFoundException;
import com.familymarket.daily.DailyService;
import com.familymarket.dto.HouseCheckRequestDto;
import com.familymarket.dto.HouseDayDto;
import com.familymarket.dto.HouseDayUpsertRequest;
import com.familymarket.dto.HouseMonthResponse;
import com.familymarket.notification.NotificationService;
import com.familymarket.store.Store;
import com.familymarket.store.StoreService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
public class HouseService {

    private final HouseDayRepository houseDayRepository;
    private final HouseCheckRequestRepository checkRequestRepository;
    private final ChildRepository childRepository;
    private final StoreService storeService;
    private final BalanceService balanceService;
    private final AchievementService achievementService;
    private final DailyService dailyService;
    private final NotificationService notificationService;

    public HouseService(HouseDayRepository houseDayRepository,
                        HouseCheckRequestRepository checkRequestRepository,
                        ChildRepository childRepository,
                        StoreService storeService,
                        BalanceService balanceService,
                        AchievementService achievementService,
                        DailyService dailyService,
                        NotificationService notificationService) {
        this.houseDayRepository = houseDayRepository;
        this.checkRequestRepository = checkRequestRepository;
        this.childRepository = childRepository;
        this.storeService = storeService;
        this.balanceService = balanceService;
        this.achievementService = achievementService;
        this.dailyService = dailyService;
        this.notificationService = notificationService;
    }

    @Transactional
    public HouseMonthResponse getMonth(Long parentId, Long storeId, Long childId, YearMonth month) {
        storeService.getOwned(parentId, storeId);
        childRepository.findByIdAndParentId(childId, parentId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        settlePending(childId);
        return buildMonth(storeId, childId, month);
    }

    @Transactional
    public HouseMonthResponse childMonth(Long childId, Long storeId, YearMonth month) {
        settlePending(childId);
        return buildMonth(storeId, childId, month);
    }

    /**
     * Проставить оценки за день. Баллы НЕ начисляются сразу — копятся как «ожидающие»
     * и начисляются 1-го числа следующего месяца.
     * Комната: от -2 до +2, помощь по дому: от -3 до +6.
     */
    @Transactional
    public HouseDayDto upsertDay(Long parentId, Long storeId, HouseDayUpsertRequest request) {
        Store store = storeService.getOwned(parentId, storeId);
        Child child = childRepository.findByIdAndParentId(request.childId(), parentId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));

        if (request.day().isAfter(LocalDate.now())) {
            throw new BadRequestException("Нельзя проставить баллы за ещё не наступившую дату");
        }

        int roomScore = request.roomScore() == null ? 0 : request.roomScore();
        int livingScore = request.livingScore() == null ? 0 : request.livingScore();
        if (roomScore < -2 || roomScore > 2) {
            throw new BadRequestException("Оценка комнаты от -2 до +2");
        }
        if (livingScore < -3 || livingScore > 6) {
            throw new BadRequestException("Оценка помощи от -3 до +6");
        }

        HouseDay day = houseDayRepository.findByStoreIdAndChildIdAndDay(storeId, child.getId(), request.day())
                .orElseGet(() -> {
                    HouseDay created = new HouseDay();
                    created.setStore(store);
                    created.setChild(child);
                    created.setDay(request.day());
                    created.setSettled(false);
                    return created;
                });

        day.setRoomScore(roomScore);
        day.setLivingScore(livingScore);
        day.setPoints(BigDecimal.valueOf(roomScore + livingScore));
        day.setUpdatedAt(Instant.now());
        houseDayRepository.save(day);
        return HouseDayDto.from(day);
    }

    // ---------- Запросы проверки комнаты ----------

    /**
     * Ребёнок просит проверить комнату (клик по сегодняшнему дню в календаре).
     */
    @Transactional
    public HouseCheckRequestDto requestCheck(Long childId, Long storeId) {
        Store store = storeService.getOwned(childRepository.findParentIdById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден")), storeId);
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        LocalDate today = LocalDate.now();
        if (checkRequestRepository.findByChildIdAndDay(childId, today).isPresent()) {
            throw new BadRequestException("Запрос на сегодня уже отправлен");
        }
        HouseCheckRequest request = new HouseCheckRequest();
        request.setChild(child);
        request.setStore(store);
        request.setDay(today);
        request.setStatus("PENDING");
        request.setCreatedAt(Instant.now());
        HouseCheckRequest saved = checkRequestRepository.save(request);
        notificationService.create(childId, "HOUSE_CHECK", "Проверь комнату",
                "Ребёнок просит проверить комнату (" + today + ")", "house", saved.getId());
        return HouseCheckRequestDto.from(saved);
    }

    @Transactional(readOnly = true)
    public List<HouseCheckRequestDto> listCheckRequests(Long parentId) {
        return checkRequestRepository.findByChild_ParentIdOrderByCreatedAtDesc(parentId)
                .stream().map(HouseCheckRequestDto::from).toList();
    }

    /**
     * Родитель подтверждает проверку: +1 к оценке комнаты за день, дейлик дома выполнен.
     */
    @Transactional
    public HouseCheckRequestDto approveCheck(Long parentId, Long requestId) {
        HouseCheckRequest request = checkRequestRepository.findByIdAndChild_ParentId(requestId, parentId)
                .orElseThrow(() -> new NotFoundException("Запрос не найден"));
        if (!"PENDING".equals(request.getStatus())) {
            throw new BadRequestException("Запрос уже обработан");
        }
        notificationService.markDoneByRef("house", requestId);
        request.setStatus("APPROVED");
        request.setResolvedAt(Instant.now());
        checkRequestRepository.save(request);

        HouseDay day = houseDayRepository
                .findByStoreIdAndChildIdAndDay(request.getStore().getId(), request.getChild().getId(), request.getDay())
                .orElseGet(() -> {
                    HouseDay created = new HouseDay();
                    created.setStore(request.getStore());
                    created.setChild(request.getChild());
                    created.setDay(request.getDay());
                    created.setSettled(false);
                    return created;
                });
        day.setRoomScore(Math.max(day.getRoomScore(), request.getRoomScore()));
        day.setPoints(BigDecimal.valueOf(day.getRoomScore() + day.getLivingScore()));
        day.setUpdatedAt(Instant.now());
        houseDayRepository.save(day);

        dailyService.recordHouse(request.getChild().getId());
        return HouseCheckRequestDto.from(request);
    }

    @Transactional
    public HouseCheckRequestDto rejectCheck(Long parentId, Long requestId) {
        HouseCheckRequest request = checkRequestRepository.findByIdAndChild_ParentId(requestId, parentId)
                .orElseThrow(() -> new NotFoundException("Запрос не найден"));
        if (!"PENDING".equals(request.getStatus())) {
            throw new BadRequestException("Запрос уже обработан");
        }
        notificationService.markDoneByRef("house", requestId);
        request.setStatus("REJECTED");
        request.setResolvedAt(Instant.now());
        return HouseCheckRequestDto.from(checkRequestRepository.save(request));
    }

    /**
     * Начислить в баланс баллы за все отмеченные дни прошлых месяцев (лениво, при обращении).
     */
    @Transactional
    public void settlePending(Long childId) {
        LocalDate firstOfMonth = YearMonth.now().atDay(1);
        List<HouseDay> pending = houseDayRepository.findByChildIdAndSettledFalseAndDayBefore(childId, firstOfMonth);
        for (HouseDay day : pending) {
            if (day.getPoints().signum() != 0) {
                balanceService.credit(childId, day.getStore().getId(), day.getPoints());
            }
            day.setSettled(true);
            day.setUpdatedAt(Instant.now());
            houseDayRepository.save(day);
        }
        if (!pending.isEmpty()) {
            achievementService.checkProgress(childId);
        }
    }

    private HouseMonthResponse buildMonth(Long storeId, Long childId, YearMonth month) {
        LocalDate from = month.atDay(1);
        LocalDate to = month.atEndOfMonth();
        List<HouseDayDto> days = houseDayRepository
                .findByStoreIdAndChildIdAndDayBetweenOrderByDayAsc(storeId, childId, from, to)
                .stream().map(HouseDayDto::from).toList();

        long positiveRoom = days.stream().filter(d -> d.roomScore() > 0).count();
        long positiveLiving = days.stream().filter(d -> d.livingScore() > 0).count();
        long negative = days.stream()
                .filter(d -> d.roomScore() < 0 || d.livingScore() < 0).count();
        BigDecimal monthPoints = days.stream()
                .map(HouseDayDto::points)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal pendingPoints = days.stream()
                .filter(d -> !d.settled())
                .map(HouseDayDto::points)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new HouseMonthResponse(month.toString(), days, positiveRoom, positiveLiving, negative,
                monthPoints, pendingPoints);
    }
}