package com.familymarket.dungeon;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Планировщик подземелий: ежедневное начисление выносливости в 09:00 МСК
 * и возобновление походов героев, остановившихся на отдых.
 */
@Component
public class DungeonStaminaScheduler {

    private final DungeonService dungeonService;

    public DungeonStaminaScheduler(DungeonService dungeonService) {
        this.dungeonService = dungeonService;
    }

    /** Каждый день в 09:00 по Москве. */
    @Scheduled(cron = "0 0 9 * * *", zone = "Europe/Moscow")
    public void refreshStaminaAndResume() {
        dungeonService.dailyRefresh();
    }
}
