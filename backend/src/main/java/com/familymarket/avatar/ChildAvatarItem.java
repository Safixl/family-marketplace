package com.familymarket.avatar;

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

/**
 * Предмет кастомизации, выданный ребёнку (за ачивку, квест или покупку).
 * equipped = предмет надет на аватаре сейчас.
 */
@Entity
@Table(name = "child_avatar_items")
@Getter
@Setter
public class ChildAvatarItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_id", nullable = false)
    private AvatarItem item;

    @Column(nullable = false)
    private boolean equipped;

    @Column(name = "unlocked_at", nullable = false, updatable = false)
    private Instant unlockedAt;
}
