package com.familymarket.notification;

import com.familymarket.child.Child;
import com.familymarket.user.User;
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

/**
 * Уведомление родителя: запрос/отбивка ребёнка, по которым нужен ответ,
 * или событие (например, исчерпание лимита). status: NEW / DONE.
 */
@Entity
@Table(name = "parent_notifications")
@Getter
@Setter
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "parent_id", nullable = false)
    private User parent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_id")
    private Child child;

    /** QUEST / CARD_REVEAL / CARD_HELP / HOUSE_CHECK / POCKET / READING_DONE / BOOK_REQUEST / LIMIT_* */
    @Column(nullable = false, length = 40)
    private String type;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 2000)
    private String payload;

    @Column(name = "ref_type", length = 40)
    private String refType;

    @Column(name = "ref_id")
    private Long refId;

    @Column(nullable = false, length = 20)
    private String status = "NEW";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}