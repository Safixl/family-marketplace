package com.familymarket.langcard;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/** Слово словаря (сид упорядочен от самых нужных к менее важным). */
@Entity
@Table(name = "lang_words")
@Getter
@Setter
public class LangWord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 8)
    private String lang = "en";

    @Column(name = "foreign_text", nullable = false, length = 100)
    private String foreignText;

    @Column(name = "ru_text", nullable = false, length = 100)
    private String ruText;

    /** Группа сложности 1..6 (по классам) — влияет на попадание в задачи по сложности. */
    @Column(name = "difficulty_level", nullable = false)
    private int difficultyLevel;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;
}
