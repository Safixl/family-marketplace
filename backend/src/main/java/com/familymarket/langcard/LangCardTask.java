package com.familymarket.langcard;

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

/** Задача карточки языка. Для SECRET_STORIES ответ = "иностранное|русское". */
@Entity
@Table(name = "lang_card_tasks")
@Getter
@Setter
public class LangCardTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "card_id", nullable = false)
    private LangCard card;

    @Enumerated(EnumType.STRING)
    @Column(name = "task_type", nullable = false, length = 32)
    private LangTaskType taskType;

    @Column(nullable = false, length = 600)
    private String text;

    /** Для авто-задач — правильный ответ (для SECRET_STORIES "en|ru"); для ручных — пусто. */
    @Column(nullable = false, length = 200)
    private String answer = "";

    /** Слово словаря, к которому привязана задача (для серии 50 без ошибок). */
    @Column(name = "word_id")
    private Long wordId;
}
