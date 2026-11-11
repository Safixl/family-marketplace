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

    /** Все дни ребёнка по порядку дат (для расчёта стрика «Хозяйственность»). */
    List<HouseDay> findByChildIdOrderByDayAsc(Long childId);

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

    /**
     * Текущая серия дней с положительной оценкой (стрик) одним SQL-запросом с оконными функциями.
     * Режим: 'ROOM' — порядок в комнате, 'HELP' — помощь по дому.
     * Серия учитывается, если последний день — сегодня или вчера.
     */
    @Query(value = """
            WITH days AS (
                SELECT DISTINCT day FROM house_days
                WHERE child_id = :childId
                  AND (:mode = 'ROOM' AND room_score > 0 OR :mode = 'HELP' AND living_score > 0)
            ),
            grp AS (
                SELECT day, (day - (ROW_NUMBER() OVER (ORDER BY day))::int) AS g FROM days
            ),
            series AS (
                SELECT g, COUNT(*) AS cnt, MAX(day) AS mx FROM grp GROUP BY g
            )
            SELECT COALESCE((SELECT cnt FROM series
                             WHERE mx IN (CURRENT_DATE, CURRENT_DATE - 1)
                             ORDER BY mx DESC LIMIT 1), 0)
            """, nativeQuery = true)
    long currentPositiveStreak(@Param("childId") Long childId, @Param("mode") String mode);
}