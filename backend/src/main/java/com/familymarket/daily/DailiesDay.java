package com.familymarket.daily;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;

/**
 * «День дейликов»: начинается в 09:00 МСК (как лимиты экрана и выносливость).
 * До 9:00 утра действует вчерашний день — результаты ребёнка не пропадают в полночь.
 */
public final class DailiesDay {

    private static final ZoneId ZONE = ZoneId.of("Europe/Moscow");

    private DailiesDay() {
    }

    /** Текущий день дейликов (дата, к которой привязаны карточки и счётчики). */
    public static LocalDate current() {
        ZonedDateTime msk = Instant.now().atZone(ZONE);
        ZonedDateTime dayStart = msk.toLocalDate().atTime(9, 0).atZone(ZONE);
        return msk.isBefore(dayStart) ? msk.toLocalDate().minusDays(1) : msk.toLocalDate();
    }
}
