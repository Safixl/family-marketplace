package com.familymarket.reading;

import com.familymarket.child.Child;
import com.familymarket.store.Store;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

/** Настройки дейлика чтения: сколько страниц в день и награда (задаёт родитель). */
@Entity
@Table(name = "reading_settings")
@Getter
@Setter
public class ReadingSettings {

    @Id
    @Column(name = "child_id")
    private Long childId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_id", insertable = false, updatable = false)
    private Child child;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(name = "pages_target", nullable = false)
    private int pagesTarget = 20;

    @Column(name = "reward_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal rewardAmount = BigDecimal.ZERO;

    @Column(name = "xp_reward", nullable = false)
    private int xpReward;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}