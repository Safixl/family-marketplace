package com.familymarket.logiccard;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/** Тема логики (расширяемый пул на уровне БД). */
@Entity
@Table(name = "logic_topics")
@Getter
@Setter
public class LogicTopic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 32)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "grade_label", nullable = false, length = 50)
    private String gradeLabel;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;
}
