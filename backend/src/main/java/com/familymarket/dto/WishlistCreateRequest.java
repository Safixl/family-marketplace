package com.familymarket.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record WishlistCreateRequest(
        @NotBlank(message = "Укажите, что вы хотите") @Size(max = 500, message = "Слишком длинное описание") String title,
        @Size(max = 1000, message = "Ссылка слишком длинная") String link,
        @DecimalMin(value = "0", message = "Цена не может быть отрицательной") BigDecimal price,
        @Min(value = 1, message = "Степень желания от 1 до 5") @Max(value = 5, message = "Степень желания от 1 до 5") Integer desire) {
}
