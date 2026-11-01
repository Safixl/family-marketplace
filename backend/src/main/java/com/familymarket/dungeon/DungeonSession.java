package com.familymarket.dungeon;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Поход в данж: события рассчитываются наперёд движком и сохраняются в log_json
 * с таймстампами (текстовая трансляция путешествия героя).
 */
@Entity
@Table(name = "dungeon_sessions")
@Getter
@Setter
public class DungeonSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "child_id", nullable = false)
    private Long childId;

    @Column(name = "dungeon_code", nullable = false, length = 32)
    private String dungeonCode;

    /** Ранг сгенерированного квеста: F/D/C/B/A/S. */
    @Column(nullable = false, length = 4)
    private String rank = "F";

    /** Уровень монстров данжа (диапазон ранга). */
    @Column(name = "monster_level", nullable = false)
    private int monsterLevel = 1;

    /** Название и эмодзи сгенерированной темы данжа. */
    @Column(name = "dungeon_name", length = 150)
    private String dungeonName;

    @Column(name = "dungeon_emoji", length = 8)
    private String dungeonEmoji;

    /** ACTIVE (идёт) / RESTING (герой заснул) / WON (зачистка) / LOST (поражение). */
    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(name = "rooms_total", nullable = false)
    private int roomsTotal;

    /** Комната, где герой находится сейчас. */
    @Column(name = "current_room", nullable = false)
    private int currentRoom = 1;

    /** Тактика перед боссом удалась (модификатор боя ×2.0). */
    @Column(name = "tactic_ok", nullable = false)
    private boolean tacticOk = false;

    /** JSON-массив исследованных фич: ["3:fork","4:chest","5:secret","6:tactic","2:forkfail"]. */
    @Column(name = "discovered_json", nullable = false, columnDefinition = "text")
    private String discoveredJson = "[]";

    /** JSON-массив номеров комнат с убитыми монстрами: [2,4]. */
    @Column(name = "killed_json", nullable = false, columnDefinition = "text")
    private String killedJson = "[]";

    /** JSON-массив событий таймлайна: [{"at":"...","icon":"...","text":"..."}]. */
    @Column(name = "log_json", nullable = false, columnDefinition = "text")
    private String logJson = "[]";

    @Column(name = "reward_coins", nullable = false, precision = 12, scale = 2)
    private BigDecimal rewardCoins = BigDecimal.ZERO;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt = Instant.now();

    private Instant finishedAt;

    /** День возобновления похода после отдыха (9:00 МСК следующего дня). */
    @Column(name = "resume_day")
    private LocalDate resumeDay;

    @PrePersist
    void onCreate() {
        if (startedAt == null) {
            startedAt = Instant.now();
        }
    }
}
