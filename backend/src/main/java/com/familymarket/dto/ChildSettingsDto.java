package com.familymarket.dto;

import com.familymarket.child.Child;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;

public record ChildSettingsDto(String theme, List<String> homeWidgets) {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final List<String> DEFAULT_WIDGETS = List.of("balances", "stats", "achievements", "orders");

    public static ChildSettingsDto from(Child child) {
        String theme = child.getTheme() == null || child.getTheme().isBlank() ? "rainbow" : child.getTheme();
        return new ChildSettingsDto(theme, parseWidgets(child.getHomeWidgets()));
    }

    private static List<String> parseWidgets(String raw) {
        if (raw == null || raw.isBlank()) {
            return new ArrayList<>(DEFAULT_WIDGETS);
        }
        try {
            List<String> widgets = MAPPER.readValue(raw, new TypeReference<List<String>>() {
            });
            return widgets == null || widgets.isEmpty() ? new ArrayList<>(DEFAULT_WIDGETS) : widgets;
        } catch (Exception e) {
            return new ArrayList<>(DEFAULT_WIDGETS);
        }
    }
}
