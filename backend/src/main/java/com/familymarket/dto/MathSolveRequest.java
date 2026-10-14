package com.familymarket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MathSolveRequest(
        @NotBlank(message = "Введите ответ") @Size(max = 255, message = "Ответ слишком длинный") String answer) {
}