package com.familymarket.dto;

import java.math.BigDecimal;

public record MathSolveResult(boolean correct, BigDecimal points, String correctAnswer) {
}