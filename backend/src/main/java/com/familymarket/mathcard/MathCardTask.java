package com.familymarket.mathcard;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/** Задача сгенерированной карточки. */
@Entity
@Table(name = "math_card_tasks")
@Getter
@Setter
public class MathCardTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "card_id", nullable = false)
    private MathCard card;

    @Column(name = "topic_code", nullable = false, length = 32)
    private String topicCode;

    @Column(name = "task_type", nullable = false, length = 16)
    private String taskType;

    @Column(nullable = false, length = 500)
    private String text;

    @Column(nullable = false, length = 100)
    private String answer;
}