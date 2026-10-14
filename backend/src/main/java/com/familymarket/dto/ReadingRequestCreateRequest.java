package com.familymarket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReadingRequestCreateRequest(
        @NotBlank(message = "Укажите название или ссылку на книгу")
        @Size(max = 500, message = "Слишком длинное название") String title) {
}