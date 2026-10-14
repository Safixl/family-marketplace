package com.familymarket.dto;

import com.familymarket.math.MathAttempt;

import java.math.BigDecimal;
import java.time.Instant;

public record MathAttemptDto(Long id, Long taskId, String taskTitle, String answer, boolean correct,
                             BigDecimal points, Instant attemptedAt) {

    public static MathAttemptDto from(MathAttempt attempt) {
        return new MathAttemptDto(
                attempt.getId(),
                attempt.getTask().getId(),
                attempt.getTask().getTitle(),
                attempt.getAnswer(),
                attempt.isCorrect(),
                attempt.getPoints(),
                attempt.getAttemptedAt());
    }
}