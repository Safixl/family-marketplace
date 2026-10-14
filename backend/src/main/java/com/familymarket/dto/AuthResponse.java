package com.familymarket.dto;

public record AuthResponse(String token, UserDto user) {
}