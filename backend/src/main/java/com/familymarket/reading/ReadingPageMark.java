package com.familymarket.reading;

import com.familymarket.child.Child;
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

import java.time.Instant;
import java.time.LocalDate;

/** Отметка страницы по дням — источник дейлика чтения (сумма дельт за день). */
@Entity
@Table(name = "reading_page_marks")
@Getter
@Setter
public class ReadingPageMark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "book_id", nullable = false)
    private ReadingBook book;

    @Column(nullable = false)
    private int page;

    @Column(nullable = false)
    private LocalDate day;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}