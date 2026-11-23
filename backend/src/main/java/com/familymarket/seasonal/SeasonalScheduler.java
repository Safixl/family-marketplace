package com.familymarket.seasonal;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Закрытие сезонных ивентов: каждый день в 00:05 по Москве.
 * <p>
 * Ивенты без флага «не удалять после окончания» удаляются вместе с магазином,
 * товарами и валютой. Ивенты с флагом остаются у родителя, но магазин скрывается
 * от ребёнка до повторного запуска.
 */
@Component
public class SeasonalScheduler {

    private final SeasonalService seasonalService;

    public SeasonalScheduler(SeasonalService seasonalService) {
        this.seasonalService = seasonalService;
    }

    @Scheduled(cron = "0 5 0 * * *", zone = "Europe/Moscow")
    public void closeExpiredEvents() {
        seasonalService.closeExpired();
    }
}
