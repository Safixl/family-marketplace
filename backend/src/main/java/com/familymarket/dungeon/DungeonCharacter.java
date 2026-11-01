package com.familymarket.dungeon;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Персонаж-авантюрист (один на ребёнка). PK = child_id (один персонаж на ребёнка).
 * status: LOCKED (обучение) / FREE (свободен) / IN_DUNGEON (в походе) / RESTING (отдых в данже).
 */
@Entity
@Table(name = "dungeon_characters")
@Getter
@Setter
public class DungeonCharacter {

    @Id
    @Column(name = "child_id")
    private Long childId;

    /** WARRIOR / MAGE / ARCHER (null — класс ещё не выбран). */
    @Column(name = "class", length = 16)
    private String characterClass;

    /** LOCKED / FREE / IN_DUNGEON / RESTING. */
    @Column(nullable = false, length = 20)
    private String status = "LOCKED";

    /** Текущая выносливость в процентах. */
    @Column(nullable = false)
    private int stamina = 100;

    /** Постоянный бонус к максимальной выносливости (ранги «Порядка в комнате»). */
    @Column(name = "max_stamina_bonus", nullable = false)
    private int maxStaminaBonus = 0;

    /** Последний день восстановления выносливости (лимит 09:00 МСК). */
    @Column(name = "last_refresh_day")
    private LocalDate lastRefreshDay;

    /** Рекорд игрока: максимальный зачищенный ранг данжа (NONE/F/D/C/B/A/S). */
    @Column(name = "max_cleared_rank", nullable = false, length = 4)
    private String maxClearedRank = "NONE";

    /** Число успешных зачисток данжей. */
    @Column(nullable = false)
    private int victories = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
