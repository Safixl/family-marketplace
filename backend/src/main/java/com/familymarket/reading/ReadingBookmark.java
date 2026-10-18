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
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/** Текущая страница книги (закладка ребёнка). */
@Entity
@Table(name = "reading_bookmarks", uniqueConstraints = @UniqueConstraint(columnNames = {"child_id", "book_id"}))
@Getter
@Setter
public class ReadingBookmark {

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

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}