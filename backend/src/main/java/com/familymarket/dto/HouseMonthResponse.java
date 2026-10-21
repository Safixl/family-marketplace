package com.familymarket.dto;

import java.math.BigDecimal;
import java.util.List;

public record HouseMonthResponse(String month, List<HouseDayDto> days,
                                 long positiveRoomDays, long positiveLivingDays, long negativeDays,
                                 BigDecimal monthPoints, BigDecimal pendingPoints,
                                 int currentStreak, int nextStreakBonus, String streakEnd) {
}