package com.familymarket.inventory;

import com.familymarket.child.Child;
import com.familymarket.product.Product;
import com.familymarket.purchase.Purchase;
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

import java.time.Instant;

/**
 * Купленный, но ещё не использованный ребёнком товар.
 * Статусы: AVAILABLE / ACTIVATION_PENDING / ACTIVATED.
 */
@Entity
@Table(name = "inventory_items")
@Getter
@Setter
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "purchase_id", nullable = false)
    private Purchase purchase;

    @Column(nullable = false, length = 20)
    private String status = "AVAILABLE";

    /** Тип инвентаря: COUPON (купон-снадобье) / WARDROBE (цифровая кастомизация). */
    @Column(name = "item_type", nullable = false, length = 20)
    private String itemType = "COUPON";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "resolved_at")
    private Instant resolvedAt;
}
