package com.familymarket.limit;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Конвертер настроек лимитов: JSON-строка в БД ↔ {@link LimitSettings}.
 * Некорректный JSON трактуется как «настройки по умолчанию», чтобы не ломать чтение лимитов.
 */
@Converter
public class LimitSettingsConverter implements AttributeConverter<LimitSettings, String> {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(LimitSettings attribute) {
        if (attribute == null) {
            return null;
        }
        try {
            return MAPPER.writeValueAsString(attribute);
        } catch (Exception e) {
            throw new IllegalStateException("Не удалось сериализовать настройки лимитов", e);
        }
    }

    @Override
    public LimitSettings convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return new LimitSettings();
        }
        try {
            return MAPPER.readValue(dbData, LimitSettings.class);
        } catch (Exception e) {
            return new LimitSettings();
        }
    }
}
