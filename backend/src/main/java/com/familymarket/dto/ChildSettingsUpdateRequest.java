package com.familymarket.dto;

import jakarta.validation.constraints.Size;

import java.util.List;

public record ChildSettingsUpdateRequest(
        @Size(max = 32, message = "Тема слишком длинная") String theme,
        @Size(max = 10, message = "Слишком много виджетов") List<String> homeWidgets) {
}
