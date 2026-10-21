package com.familymarket.mathcard;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Генератор математических выражений: принимает [тему] и [финальный уровень сложности]
 * и подставляет случайные числа, соответствующие возрастной группе и сложности.
 *
 * Уровни EASY…EXTREME масштабируют диапазон чисел; OLYMPIAD использует статичные шаблоны
 * (отдельное хранилище math_olympiad_cards / math_olympiad_tasks).
 */
@Component
public class MathCardGenerator {

    /** Сгенерированная задача (текст + правильный ответ + тип механики). */
    public record GeneratedTask(String topicCode, String taskType, String text, String answer) {
    }

    private static final Random RND = new Random();

    private final MathOlympiadRepository olympiadRepository;
    private final MathOlympiadTaskRepository olympiadTaskRepository;

    public MathCardGenerator(MathOlympiadRepository olympiadRepository,
                             MathOlympiadTaskRepository olympiadTaskRepository) {
        this.olympiadRepository = olympiadRepository;
        this.olympiadTaskRepository = olympiadTaskRepository;
    }

    /** Динамическая генерация одной задачи по теме и уровню. */
    public GeneratedTask generate(String topicCode, MathDifficulty level) {
        int lvl = level.ordinal();
        return switch (topicCode) {
            case "ADD_SUB" -> addSub(lvl);
            case "MUL_DIV" -> mulDiv(lvl);
            case "EQUATIONS" -> equations(lvl);
            case "VARIABLES" -> variables(lvl);
            case "FRACTIONS" -> fractions(lvl);
            case "NEGATIVE" -> negative(lvl);
            case "DECIMALS" -> decimals(lvl);
            case "ROOTS" -> roots(lvl);
            case "SQUARES_CUBES" -> squaresCubes(lvl);
            default -> addSub(lvl);
        };
    }

    /** Статичные олимпиадные задачи: копия выбранного шаблона (уровень OLYMPIAD). */
    public List<GeneratedTask> olympiadTasks(Long templateId) {
        List<GeneratedTask> out = new ArrayList<>();
        for (MathOlympiadTask t : olympiadTaskRepository.findByCardIdOrderByIdAsc(templateId)) {
            out.add(new GeneratedTask("OLYMPIAD", t.getTaskType(), t.getText(), t.getAnswer()));
        }
        return out;
    }

    /** Случайный олимпиадный шаблон (по названию/классу задаётся севом). */
    public MathOlympiadCard pickOlympiadTemplate() {
        List<MathOlympiadCard> cards = olympiadRepository.findAllByOrderByIdAsc();
        if (cards.isEmpty()) {
            throw new IllegalStateException("Олимпиадные шаблоны не настроены");
        }
        return cards.get(RND.nextInt(cards.size()));
    }

    // ---------- Темы ----------

    private GeneratedTask addSub(int lvl) {
        int max = scale(lvl);
        boolean allowNeg = lvl >= 4;
        if (RND.nextBoolean()) {
            int a = num(1, max);
            int b = num(1, max);
            return cal("ADD_SUB", a + " + " + b, String.valueOf(a + b));
        }
        int a = num(1, max);
        int b = allowNeg ? num(1, max * 2) : num(1, Math.min(a, max));
        int result = a - b;
        return cal("ADD_SUB", a + " − " + b, String.valueOf(result));
    }

    private GeneratedTask mulDiv(int lvl) {
        int max = scale(lvl);
        int a = num(2, Math.max(2, max / 10 + 1));
        int b = num(2, Math.max(2, Math.min(12, max)));
        if (RND.nextBoolean()) {
            int prod = a * b;
            return cal("MUL_DIV", a + " × " + b, String.valueOf(prod));
        }
        int prod = a * b;
        return cal("MUL_DIV", prod + " ÷ " + a, String.valueOf(b));
    }

    private GeneratedTask equations(int lvl) {
        int max = scale(lvl);
        int a = num(2, Math.max(2, 12 - lvl));
        int b = num(1, max);
        switch (RND.nextInt(4)) {
            case 0 -> {
                // x + a = c
                int c = a + b;
                return eq("x + " + a + " = " + c, String.valueOf(b));
            }
            case 1 -> {
                // x − a = c
                int c = a - a / 2;
                int x = c + a;
                return eq("x − " + a + " = " + c, String.valueOf(x));
            }
            case 2 -> {
                // a · x = c
                int c = a * b;
                return eq(a + " · x = " + c, String.valueOf(b));
            }
            default -> {
                // x ÷ a = c
                int c = a * b;
                return eq("x ÷ " + a + " = " + b, String.valueOf(c));
            }
        }
    }

    private GeneratedTask variables(int lvl) {
        int max = scale(lvl);
        int k = num(2, Math.max(2, 5 - lvl / 2));
        int x = num(1, Math.max(2, 20 + lvl * 5));
        int m = num(1, Math.max(2, 10 + lvl * 4));
        int c = k * x + m;
        return text("VARIABLES", "Найди x: " + k + "·x + " + m + " = " + c, String.valueOf(x));
    }

    private GeneratedTask fractions(int lvl) {
        int den = num(2, Math.min(12, 4 + lvl * 2));
        int n1 = num(1, den - 1);
        int n2 = num(1, den - 1);
        if (RND.nextBoolean()) {
            int sum = n1 + n2;
            return text("FRACTIONS", n1 + "/" + den + " + " + n2 + "/" + den + " = ?", reduce(sum, den));
        }
        if (n1 < n2) {
            int t = n1;
            n1 = n2;
            n2 = t;
        }
        return text("FRACTIONS", n1 + "/" + den + " − " + n2 + "/" + den + " = ?", reduce(n1 - n2, den));
    }

    private GeneratedTask negative(int lvl) {
        int max = scale(lvl);
        int a = num(1, max);
        int b = num(1, max);
        switch (RND.nextInt(3)) {
            case 0 -> {
                int result = -a + b;
                return cal("NEGATIVE", "(−" + a + ") + " + b, String.valueOf(result));
            }
            case 1 -> {
                int result = a - b;
                return cal("NEGATIVE", a + " − " + b + " (знак результата)", String.valueOf(result));
            }
            default -> {
                int result = -a * b;
                return cal("NEGATIVE", "(−" + a + ") × " + b, String.valueOf(result));
            }
        }
    }

    private GeneratedTask decimals(int lvl) {
        int max = Math.max(10, scale(lvl) / 10);
        int a = num(10, max);
        int b = num(10, max);
        int a1 = a / 10, a2 = a % 10;
        int b1 = b / 10, b2 = b % 10;
        int sum = a1 * 10 + a2 + b1 * 10 + b2;
        String text = (a1 + "," + a2) + " + " + (b1 + "," + b2) + " = ?";
        String answer = (sum / 10) + "," + (sum % 10);
        return cal("DECIMALS", text, answer);
    }

    private GeneratedTask roots(int lvl) {
        int base = num(2, Math.min(12, 3 + lvl * 2));
        int root = base * base;
        int extra = num(1, Math.min(9, 2 + lvl));
        return cal("ROOTS", "√" + root + " + " + extra, String.valueOf(base + extra));
    }

    private GeneratedTask squaresCubes(int lvl) {
        int n = num(2, Math.min(12, 3 + lvl * 2));
        if (RND.nextBoolean()) {
            return cal("SQUARES_CUBES", n + "²", String.valueOf(n * n));
        }
        return cal("SQUARES_CUBES", n + "³", String.valueOf(n * n * n));
    }

    // ---------- Хелперы ----------

    private GeneratedTask cal(String topic, String text, String answer) {
        return new GeneratedTask(topic, "CALC", text, answer);
    }

    private GeneratedTask eq(String text, String answer) {
        return new GeneratedTask("EQUATIONS", "EQUATION", text, answer);
    }

    private GeneratedTask text(String topic, String text, String answer) {
        return new GeneratedTask(topic, "TEXT", text, answer);
    }

    /** Диапазон чисел по уровню: EASY(0)…EXTREME(4). */
    private static int scale(int lvl) {
        return switch (lvl) {
            case 0 -> 10;
            case 1 -> 100;
            case 2 -> 300;
            case 3 -> 1000;
            default -> 5000;
        };
    }

    private static int num(int min, int max) {
        return min + RND.nextInt(Math.max(1, max - min + 1));
    }

    /** Сокращение дроби до вида "n/d" (d=1 → целое число). */
    private static String reduce(int n, int d) {
        if (n == 0) {
            return "0";
        }
        int g = gcd(n, d);
        n /= g;
        d /= g;
        return d == 1 ? String.valueOf(n) : n + "/" + d;
    }

    private static int gcd(int a, int b) {
        while (b != 0) {
            int t = a % b;
            a = b;
            b = t;
        }
        return Math.max(1, a);
    }
}