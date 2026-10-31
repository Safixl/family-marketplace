package com.familymarket.langcard;

import com.familymarket.child.Child;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/** Прогресс ребёнка по слову: изучает (ACTIVE) / изучил (LEARNED). */
@Entity
@Table(name = "lang_word_progress")
@Getter
@Setter
public class LangWordProgress {

    public enum Status {
        ACTIVE, LEARNED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "word_id", nullable = false)
    private LangWord word;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Status status = Status.ACTIVE;

    /** Серия верных ответов подряд; 50 без ошибок = слово изучено. */
    @Column(name = "correct_streak", nullable = false)
    private int correctStreak = 0;

    @Column(name = "total_correct", nullable = false)
    private int totalCorrect = 0;

    @Column(name = "total_attempts", nullable = false)
    private int totalAttempts = 0;

    @Column(name = "activated_at")
    private Instant activatedAt;

    @Column(name = "learned_at")
    private Instant learnedAt;
}
