package com.familymarket.dto;

/**
 * Мини-задание дейлика (логика, математика). answer хранится только на сервере.
 */
public record DailyTaskDto(long index, String type, String question) {
}
