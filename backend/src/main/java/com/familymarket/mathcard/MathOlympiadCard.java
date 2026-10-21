package com.familymarket.mathcard;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/** Статичная олимпиадная карточка (шаблон), структурирована по классам. */
@Entity
@Table(name = "math_olympiad_cards")
@Getter
@Setter
public class MathOlympiadCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "grade_label", nullable = false, length = 50)
    private String gradeLabel;

    @Column(nullable = false)
    private int minutes = 60;
}