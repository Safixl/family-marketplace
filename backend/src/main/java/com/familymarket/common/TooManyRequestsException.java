package com.familymarket.common;

/** 429 Too Many Requests — превышен лимит попыток (rate limiting). */
public class TooManyRequestsException extends RuntimeException {
    public TooManyRequestsException(String message) {
        super(message);
    }
}
