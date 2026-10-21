package com.familymarket.house;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HouseDayRepository extends JpaRepository<HouseDay, Long> {

    List<HouseDay> findByStoreIdAndChildIdAndDayBetweenOrderByDayAsc(Long storeId, Long childId,
                                                                     LocalDate from, LocalDate to);

    Optional<HouseDay> findByStoreIdAndChildIdAndDay(Long storeId, Long childId, LocalDate day);

    /**
     * Несеттленные дни за прошлые месяцы (день раньше первого числа текущего месяца).
     */
    List<HouseDay> findByChildIdAndSettledFalseAndDayBefore(Long childId, LocalDate day);

    @Query("select coalesce(sum(h.points), 0) from HouseDay h where h.child.id = :childId and h.settled = true")
    java.math.BigDecimal sumSettledPointsByChildId(@Param("childId") Long childId);

    @Query("select coalesce(sum(h.points), 0) from HouseDay h where h.child.id = :childId and h.settled = false")
    java.math.BigDecimal sumPendingPointsByChildId(@Param("childId") Long childId);

    @Query("select count(h) from HouseDay h where h.child.id = :childId and h.roomScore > 0")
    long countPositiveRoomByChildId(@Param("childId") Long childId);

    @Query("select count(h) from HouseDay h where h.child.id = :childId and h.livingScore > 0")
    long countPositiveLivingByChildId(@Param("childId") Long childId);

    @Query("select count(h) from HouseDay h where h.child.id = :childId "
            + "and (h.roomScore <> 0 or h.livingScore <> 0)")
    long countMarkedDaysByChildId(@Param("childId") Long childId);

    @Query("select h.day from HouseDay h where h.child.id = :childId and h.roomScore > 0 order by h.day asc")
    List<LocalDate> findCleanRoomDays(@Param("childId") Long childId);

    @Query("select h.day from HouseDay h where h.child.id = :childId and h.livingScore > 0 order by h.day asc")
    List<LocalDate> findHelpDays(@Param("childId") Long childId);

    /** Накопленные баллы за порядок в своей комнате (сумма room_score). */
    @Query("select coalesce(sum(h.roomScore), 0) from HouseDay h where h.child.id = :childId")
    long sumRoomScoreByChildId(@Param("childId") Long childId);

    /** Накопленные баллы за помощь по дому (сумма living_score). */
    @Query("select coalesce(sum(h.livingScore), 0) from HouseDay h where h.child.id = :childId")
    long sumLivingScoreByChildId(@Param("childId") Long childId);
}