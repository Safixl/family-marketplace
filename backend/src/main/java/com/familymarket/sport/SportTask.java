package com.familymarket.sport;

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

/**
 * Задание направления. Родитель гибко редактирует текст: подходы, повторения,
 * время в планке, вес гантелей и т.п. grade_min/grade_max — классы, для которых
 * упражнение доступно при генерации дейлика.
 */
@Entity
@Table(name = "sport_tasks")
@Getter
@Setter
public class SportTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "direction_id", nullable = false)
    private SportDirection direction;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(length = 500)
    private String description;

    @Column(name = "grade_min", nullable = false)
    private int gradeMin = 1;

    @Column(name = "grade_max", nullable = false)
    private int gradeMax = 8;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;
}
