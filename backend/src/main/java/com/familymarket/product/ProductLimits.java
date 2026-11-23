package com.familymarket.product;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

/**
 * Расчёт периода действия лимита покупок товара.
 * <p>
 * Сброс лимитов происходит в 09:00 по Москве — так же, как сброс дейликов,
 * чтобы «новый день» у ребёнка начинался в одно и то же время.
 */
public final class ProductLimits {

    public static final String NONE = "NONE";
    public static final String DAILY = "DAILY";
    public static final String WEEKLY = "WEEKLY";
    public static final String MONTHLY = "MONTHLY";

    private static final ZoneId ZONE = ZoneId.of("Europe/Moscow");
    private static final LocalTime RESET_TIME = LocalTime.of(9, 0);

    private ProductLimits() {
    }

    /** Приводит значение из API к допустимому: неизвестное считается одноразовым (NONE). */
    public static String normalize(String value) {
        if (value == null || value.isBlank()) {
            return NONE;
        }
        String normalized = value.trim().toUpperCase();
        return switch (normalized) {
            case DAILY, WEEKLY, MONTHLY -> normalized;
            default -> NONE;
        };
    }

    /** Одноразовый лимит — не обновляется. */
    public static boolean isOneTime(String period) {
        return NONE.equals(normalize(period));
    }

    /** Начало текущего периода (включительно). Для NONE — начало времён. */
    public static Instant periodStart(String period, Instant now) {
        String normalized = normalize(period);
        if (NONE.equals(normalized)) {
            return Instant.EPOCH;
        }
        ZonedDateTime zoned = now.atZone(ZONE);
        LocalDate date = zoned.toLocalDate();
        ZonedDateTime todayReset = date.atTime(RESET_TIME).atZone(ZONE);
        boolean beforeReset = zoned.isBefore(todayReset);
        LocalDate anchor = switch (normalized) {
            case DAILY -> beforeReset ? date.minusDays(1) : date;
            case WEEKLY -> {
                LocalDate monday = date.minusDays(date.getDayOfWeek().getValue() - 1L);
                yield beforeReset ? monday.minusWeeks(1) : monday;
            }
            case MONTHLY -> {
                LocalDate first = date.withDayOfMonth(1);
                yield beforeReset ? first.minusMonths(1) : first;
            }
            default -> date;
        };
        return anchor.atTime(RESET_TIME).atZone(ZONE).toInstant();
    }

    /** Момент следующего сброса лимита (для отображения ребёнку). Для NONE — null. */
    public static Instant nextReset(String period, Instant now) {
        String normalized = normalize(period);
        if (NONE.equals(normalized)) {
            return null;
        }
        ZonedDateTime zoned = now.atZone(ZONE);
        LocalDate date = zoned.toLocalDate();
        ZonedDateTime todayReset = date.atTime(RESET_TIME).atZone(ZONE);
        return switch (normalized) {
            case DAILY -> (zoned.isBefore(todayReset) ? todayReset : todayReset.plusDays(1)).toInstant();
            case WEEKLY -> {
                LocalDate monday = date.minusDays(date.getDayOfWeek().getValue() - 1L);
                ZonedDateTime thisMonday = monday.atTime(RESET_TIME).atZone(ZONE);
                yield (zoned.isBefore(thisMonday) ? thisMonday : thisMonday.plusWeeks(1)).toInstant();
            }
            case MONTHLY -> {
                ZonedDateTime thisFirst = date.withDayOfMonth(1).atTime(RESET_TIME).atZone(ZONE);
                yield (zoned.isBefore(thisFirst) ? thisFirst : thisFirst.plusMonths(1)).toInstant();
            }
            default -> null;
        };
    }
}
