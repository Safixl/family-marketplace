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

    @Query("select coalesce(sum(d.xp), 0) from DailyLog d where d.child.id = :childId")
    long sumXpByChildId(@Param("childId") Long childId);
}
