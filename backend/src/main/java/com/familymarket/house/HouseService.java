package com.familymarket.house;

import com.familymarket.achievement.AchievementService;
import com.familymarket.balance.BalanceService;
import com.familymarket.child.Child;
import com.familymarket.child.ChildRepository;
import com.familymarket.common.BadRequestException;
import com.familymarket.common.NotFoundException;
import com.familymarket.dto.HouseDayDto;
import com.familymarket.dto.HouseDayUpsertRequest;
import com.familymarket.dto.HouseMonthResponse;
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
    private final ChildRepository childRepository;
    private final StoreService storeService;
    private final BalanceService balanceService;
    private final AchievementService achievementService;

    public HouseService(HouseDayRepository houseDayRepository,
                        ChildRepository childRepository,
                        StoreService storeService,
                        BalanceService balanceService,
                        AchievementService achievementService) {
        this.houseDayRepository = houseDayRepository;
        this.childRepository = childRepository;
        this.storeService = storeService;
        this.balanceService = balanceService;
        this.achievementService = achievementService;
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