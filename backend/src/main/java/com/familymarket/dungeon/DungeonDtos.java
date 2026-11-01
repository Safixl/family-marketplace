package com.familymarket.dungeon;

import java.math.BigDecimal;
import java.util.List;

/** DTO модуля подземелий. */
public final class DungeonDtos {

    private DungeonDtos() {
    }

    public record DungeonStateDto(
            CharacterDto character,
            UnlockDto unlock,
            SessionDto session,
            List<EquipmentDto> equipment) {
    }

    public record CharacterDto(
            String characterClass,
            String status,
            int stamina,
            int maxStamina,
            int victories,
            String maxClearedRank) {
    }

    /** Прогресс разблокировки таверны: ранг «Железо» по Чтению И Математике. */
    public record UnlockDto(
            boolean unlocked,
            boolean readingOk,
            boolean mathOk,
            String readingRank,
            String mathRank) {
    }

    public record LogEntryDto(String at, String icon, String text) {
    }

    public record SessionDto(
            Long id,
            String dungeonCode,
            String rank,
            int monsterLevel,
            String dungeonName,
            String dungeonEmoji,
            String status,
            int currentRoom,
            int roomsTotal,
            BigDecimal rewardCoins,
            List<LogEntryDto> logs) {
    }

    public record EquipmentDto(
            Long id,
            String code,
            String name,
            String slot,
            String rarity,
            double statMultiplier,
            String icon,
            String description,
            boolean identified,
            boolean equipped) {
    }
}
