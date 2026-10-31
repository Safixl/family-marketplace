package com.familymarket.langcard;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LangWordRepository extends JpaRepository<LangWord, Long> {

    /** Весь словарь в порядке важности. */
    List<LangWord> findAllByOrderBySortOrderAsc();

    Optional<LangWord> findFirstBySortOrderGreaterThanOrderBySortOrderAsc(int sortOrder);

    /** Следующее неактивированное родителем слово (для авто-активации). */
    @Query("""
            SELECT w FROM LangWord w
            WHERE NOT EXISTS (SELECT p FROM LangWordProgress p
                              WHERE p.word.id = w.id AND p.child.id = :childId)
            ORDER BY w.sortOrder ASC
            LIMIT 1
            """)
    Optional<LangWord> findNextUnactivated(@Param("childId") Long childId);

    /** Слова из диапазона сложности (для генерации задач). */
    List<LangWord> findByDifficultyLevelBetweenOrderBySortOrderAsc(int minLevel, int maxLevel);
}
