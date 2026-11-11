package com.familymarket.daily;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyLogRepository extends JpaRepository<DailyLog, Long> {

    Optional<DailyLog> findByChildIdAndSkillAndDay(Long childId, String skill, LocalDate day);

    List<DailyLog> findByChildIdAndDay(Long childId, LocalDate day);

    List<DailyLog> findByChildIdOrderByDayDesc(Long childId);

    long countByChildIdAndSkillAndDay(Long childId, String skill, LocalDate day);

    @Query("select d.day from DailyLog d where d.child.id = :childId and d.skill = :skill " +
            "and d.points > 0 order by d.day desc")
    List<LocalDate> findActiveDays(@Param("childId") Long childId, @Param("skill") String skill);

    @Query("select coalesce(sum(d.xp), 0) from DailyLog d where d.child.id = :childId and d.skill = :skill")
    long sumXpByChildIdAndSkill(@Param("childId") Long childId, @Param("skill") String skill);

    @Query("select coalesce(sum(d.points), 0) from DailyLog d where d.child.id = :childId and d.skill = :skill")
    long sumPointsByChildIdAndSkill(@Param("childId") Long childId, @Param("skill") String skill);

    /**
     * Текущая серия активных дней (стрик) одним SQL-запросом с оконными функциями.
     * Серия учитывается, если последний активный день — сегодня или вчера.
     */
    @Query(value = """
            WITH days AS (
                SELECT DISTINCT day FROM daily_logs
                WHERE child_id = :childId AND skill = :skill AND points > 0
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
    long currentActiveStreak(@Param("childId") Long childId, @Param("skill") String skill);

    @Query("select coalesce(sum(d.xp), 0) from DailyLog d where d.child.id = :childId")
    long sumXpByChildId(@Param("childId") Long childId);
}
