package com.familymarket.deposit;

import com.familymarket.child.Child;
import com.familymarket.store.Store;
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

import java.math.BigDecimal;
import java.time.Instant;

/**
 * «Личный инвест-фонд»: часть баллов магазина (например, пиастры) лежит на депозите
 * под процент (rate = 5-10% в неделю). Проценты капитализируются раз в неделю.
 */
@Entity
@Table(name = "deposits")
@Getter
@Setter
public class Deposit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    /** Годовая ставка в неделю, % (5-10). */
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal rate = BigDecimal.valueOf(5);

    @Column(name = "last_interest_at", nullable = false)
    private Instant lastInterestAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
