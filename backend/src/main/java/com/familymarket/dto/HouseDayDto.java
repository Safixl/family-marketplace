package com.familymarket.dto;

import com.familymarket.house.HouseDay;

import java.math.BigDecimal;
import java.time.LocalDate;

public record HouseDayDto(Long id, Long storeId, Long childId, LocalDate day,
                          int roomScore, int livingScore, BigDecimal points, boolean settled, String comment) {

    public static HouseDayDto from(HouseDay day) {
        return new HouseDayDto(
                day.getId(),
                day.getStore().getId(),
                day.getChild().getId(),
                day.getDay(),
                day.getRoomScore(),
                day.getLivingScore(),
                day.getPoints(),
                day.isSettled(),
                day.getComment());
    }
}