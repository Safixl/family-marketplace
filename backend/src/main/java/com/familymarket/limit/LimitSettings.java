package com.familymarket.limit;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Расширенные настройки лимитов ребёнка (хранятся в JSON в child_limits.settings):
 * выключенные родителем стандартные типы и кастомные лимиты со своими названиями (до 3).
 */
public class LimitSettings {

    /** Выключенные стандартные типы лимитов: TV / PC / CONSOLE / PHONE / TABLET. */
    private Set<String> disabled = new HashSet<>();

    /** Кастомные лимиты (максимум 3) с названиями, минутами в день и признаком включённости. */
    private List<CustomLimit> custom = new ArrayList<>();

    public Set<String> getDisabled() {
        return disabled;
    }

    public void setDisabled(Set<String> disabled) {
        this.disabled = disabled == null ? new HashSet<>() : disabled;
    }

    public List<CustomLimit> getCustom() {
        return custom;
    }

    public void setCustom(List<CustomLimit> custom) {
        this.custom = custom == null ? new ArrayList<>() : custom;
    }

    /** Кастомный лимит: id вида C1..C3, название, минуты в день, включён/выключен. */
    public static class CustomLimit {

        private String id;
        private String name;
        private int minutes;
        private boolean enabled = true;

        public CustomLimit() {
        }

        public CustomLimit(String id, String name, int minutes, boolean enabled) {
            this.id = id;
            this.name = name;
            this.minutes = minutes;
            this.enabled = enabled;
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public int getMinutes() {
            return minutes;
        }

        public void setMinutes(int minutes) {
            this.minutes = minutes;
        }

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }
    }
}
