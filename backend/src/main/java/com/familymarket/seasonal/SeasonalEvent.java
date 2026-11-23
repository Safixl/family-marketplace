package com.familymarket.seasonal;

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
import java.time.LocalDate;
import java.time.ZoneId;

/**
 * Сезонный ивент: магазин открыт ограниченное время, валюта — сезонные жетоны.
 * Жетоны зарабатываются ТОЛЬКО через сезонные квесты ГМа.
 */
@Entity
@Table(name = "seasonal_events")
@Getter
@Setter
public class SeasonalEvent {

    private static final ZoneId ZONE = ZoneId.of("Europe/Moscow");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "parent_id", nullable = false)
    private User parent;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 2000)
    private String description;

    @Column(name = "token_name", nullable = false, length = 50)
    private String tokenName = "жетон";

    @Column(name = "token_icon", nullable = false, length = 16)
    private String tokenIcon = "🎟️";

    @Column(name = "starts_at", nullable = false)
    private LocalDate startsAt;

    @Column(name = "ends_at", nullable = false)
    private LocalDate endsAt;

    @Column(nullable = false)
    private boolean active = true;

    /**
     * Не удалять ивент и магазин после окончания: они остаются у родителя,
     * но скрыты от ребёнка до повторного запуска.
     */
    @Column(name = "keep_after_end", nullable = false)
    private boolean keepAfterEnd = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /** Ивент сейчас активен (в пределах дат). */
    public boolean isOpenNow() {
        return isOpenNow(LocalDate.now(ZONE));
    }

    public boolean isOpenNow(LocalDate today) {
        return active && !today.isBefore(startsAt) && !today.isAfter(endsAt);
    }
}
