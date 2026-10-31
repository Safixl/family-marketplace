package com.familymarket.logiccard;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

/**
 * Генератор логических задач: принимает [тему] и [финальный уровень сложности]
 * и подставляет случайные числа/символы.
 *
 * Темы: PATTERN (закономерности), ODD (найди лишнее), SYMBOLS (символьная алгебра),
 * BALANCE (весы и пропорции), RIDDLE (текстовые логические загадки), SEQUENCES.
 * Уровень OLYMPIAD использует статичные шаблоны (logic_olympiad_cards / logic_olympiad_tasks).
 */
@Component
public class LogicCardGenerator {

    /** Сгенерированная задача (текст + правильный ответ + тип механики). */
    public record GeneratedTask(String topicCode, String taskType, String text, String answer) {
    }

    private static final Random RND = new Random();

    private static final String[] FRUITS = {"🍎", "🍌", "🍇", "🍒", "🍐", "🍋"};
    private static final String[] THINGS = {"🪨", "📦", "🎁", "🧊", "🧱"};
    private static final String[] ANIMALS = {"🐱", "🐰", "🦊", "🐻", "🐼"};

    private final LogicOlympiadRepository olympiadRepository;
    private final LogicOlympiadTaskRepository olympiadTaskRepository;

    public LogicCardGenerator(LogicOlympiadRepository olympiadRepository,
                              LogicOlympiadTaskRepository olympiadTaskRepository) {
        this.olympiadRepository = olympiadRepository;
        this.olympiadTaskRepository = olympiadTaskRepository;
    }

    /** Динамическая генерация одной задачи по теме и уровню. */
    public GeneratedTask generate(String topicCode, LogicDifficulty level) {
        int lvl = level.ordinal();
        return switch (topicCode) {
            case "PATTERN" -> pattern(lvl);
            case "ODD" -> odd(lvl);
            case "SYMBOLS" -> symbols(lvl);
            case "BALANCE" -> balance(lvl);
            case "RIDDLE" -> riddle(lvl);
            case "SEQUENCES" -> sequences(lvl);
            default -> pattern(lvl);
        };
    }

    /** Статичные олимпиадные задачи: копия выбранного шаблона (уровень OLYMPIAD). */
    public List<GeneratedTask> olympiadTasks(Long templateId) {
        List<GeneratedTask> out = new ArrayList<>();
        for (LogicOlympiadTask t : olympiadTaskRepository.findByCardIdOrderByIdAsc(templateId)) {
            out.add(new GeneratedTask("OLYMPIAD", t.getTaskType(), t.getText(), t.getAnswer()));
        }
        return out;
    }

    /** Случайный олимпиадный шаблон (сид задаётся в LogicCardService). */
    public LogicOlympiadCard pickOlympiadTemplate() {
        List<LogicOlympiadCard> cards = olympiadRepository.findAllByOrderByIdAsc();
        if (cards.isEmpty()) {
            throw new IllegalStateException("Олимпиадные шаблоны логики не настроены");
        }
        return cards.get(RND.nextInt(cards.size()));
    }

    // ---------- Тема PATTERN: числовые закономерности ----------

    private GeneratedTask pattern(int lvl) {
        // EASY: арифметическая прогрессия с шагом 1..5
        if (lvl == 0) {
            int start = num(1, 10);
            int step = num(1, 5);
            List<Integer> row = arith(start, step, 5);
            return pat(row, String.valueOf(row.get(4)));
        }
        // MEDIUM: шаг больше, числа крупнее
        if (lvl == 1) {
            int start = num(10, 40);
            int step = num(3, 9);
            List<Integer> row = arith(start, step, 5);
            return pat(row, String.valueOf(row.get(4)));
        }
        // HIGH: геометрическая прогрессия ×2 / ×3
        if (lvl == 2) {
            int start = num(1, 5);
            int mul = RND.nextBoolean() ? 2 : 3;
            int v = start;
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 4; i++) {
                sb.append(v).append(", ");
                v *= mul;
            }
            sb.append("?");
            return new GeneratedTask("PATTERN", "PATTERN", "Продолжи ряд: " + sb, String.valueOf(v));
        }
        // HARD: второй порядок — разности растут (+1, +2, +3, …)
        if (lvl == 3) {
            int start = num(1, 9);
            int d = num(1, 4);
            List<Integer> row = new ArrayList<>();
            int v = start;
            int delta = d;
            for (int i = 0; i < 5; i++) {
                row.add(v);
                v += delta;
                delta++;
            }
            return pat(row, String.valueOf(row.get(4)));
        }
        // EXTREME: правило ×2+1 / ×3−2 / чередование +a, −b
        return switch (RND.nextInt(3)) {
            case 0 -> {
                int v = num(1, 4);
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < 4; i++) {
                    sb.append(v).append(", ");
                    v = v * 2 + 1;
                }
                sb.append("?");
                yield new GeneratedTask("PATTERN", "PATTERN", "Продолжи ряд: " + sb, String.valueOf(v));
            }
            case 1 -> {
                int v = num(5, 9);
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < 4; i++) {
                    sb.append(v).append(", ");
                    v = v * 3 - 2;
                }
                sb.append("?");
                yield new GeneratedTask("PATTERN", "PATTERN", "Продолжи ряд: " + sb, String.valueOf(v));
            }
            default -> {
                int a = num(2, 9);
                int b = num(1, a - 1);
                int v = num(10, 30);
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < 6; i++) {
                    sb.append(v).append(", ");
                    v = i % 2 == 0 ? v + a : v - b;
                }
                sb.append("?");
                yield new GeneratedTask("PATTERN", "PATTERN", "Продолжи ряд: " + sb, String.valueOf(v));
            }
        };
    }

    // ---------- Тема ODD: найди лишнее ----------

    private GeneratedTask odd(int lvl) {
        return switch (lvl) {
            case 0 -> {
                // Все чётные + одно нечётное
                int odd = num(1, 49) * 2 + 1;
                yield oddRow(lvl, odd, () -> num(1, 30) * 2, "Все числа чётные, а оно — нет");
            }
            case 1 -> {
                // Кратные 4 + лишнее
                int base = num(3, 12);
                yield oddRow(lvl, base * 4 + RND.nextInt(1, 4), () -> num(2, 12) * 4,
                        "Все числа делятся на 4, а оно — нет");
            }
            case 2 -> {
                // Простые + составное
                int[] primes = {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47};
                int composite = num(4, 24) * 2;
                yield oddRow(lvl, composite, () -> primes[RND.nextInt(primes.length)],
                        "Все числа простые, а оно — нет");
            }
            case 3 -> {
                // Квадраты + не-квадрат
                int notSquare = num(2, 12) * num(2, 12) + 1;
                yield oddRow(lvl, notSquare, () -> {
                    int r = num(2, 10);
                    return r * r;
                }, "Все числа — квадраты, а оно — нет");
            }
            default -> {
                // Кубы + не-куб
                int notCube = num(2, 5) * num(2, 5) * num(2, 5) + 1;
                yield oddRow(lvl, notCube, () -> {
                    int r = num(2, 5);
                    return r * r * r;
                }, "Все числа — кубы, а оно — нет");
            }
        };
    }

    private GeneratedTask oddRow(int lvl, int outsider, java.util.function.IntSupplier gen, String hintUnused) {
        Set<Integer> set = new HashSet<>();
        set.add(outsider);
        while (set.size() < 5) {
            int v = gen.getAsInt();
            if (v != outsider) {
                set.add(v);
            }
        }
        List<Integer> list = new ArrayList<>(set);
        java.util.Collections.shuffle(list);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < list.size(); i++) {
            sb.append(list.get(i));
            if (i < list.size() - 1) {
                sb.append(", ");
            }
        }
        return new GeneratedTask("ODD", "ODD", "Найди лишнее число: " + sb, String.valueOf(outsider));
    }

    // ---------- Тема SYMBOLS: символьная алгебра (эмодзи) ----------

    private GeneratedTask symbols(int lvl) {
        int pairCount = lvl >= 2 ? 3 : 2;
        String[] faces = new String[pairCount];
        Set<String> used = new HashSet<>();
        for (int i = 0; i < pairCount; i++) {
            String f;
            do {
                f = FRUITS[RND.nextInt(FRUITS.length)];
            } while (used.contains(f));
            used.add(f);
            faces[i] = f;
        }
        int[] val = new int[pairCount];
        for (int i = 0; i < pairCount; i++) {
            val[i] = num(2, lvl >= 3 ? 15 : 9);
        }
        // Уравнения: цепочка, где каждое следующее вводит новый символ
        List<String> eqs = new ArrayList<>();
        if (pairCount == 2) {
            if (lvl >= 1 && lvl != 4) {
                eqs.add(faces[0] + " × 2 = " + (val[0] * 2));
            } else {
                eqs.add(faces[0] + " + " + faces[0] + " = " + (val[0] * 2));
            }
            int sum = val[0] + val[1];
            eqs.add(faces[0] + " + " + faces[1] + " = " + sum);
            return new GeneratedTask("SYMBOLS", "SYMBOLS",
                    String.join(", ", eqs) + " → " + faces[1] + " = ?", String.valueOf(val[1]));
        }
        // 3 символа
        eqs.add(faces[0] + " + " + faces[0] + " = " + (val[0] * 2));
        eqs.add(faces[0] + " + " + faces[1] + " = " + (val[0] + val[1]));
        int last;
        if (lvl >= 3) {
            last = val[1] * 2 + val[2];
            eqs.add(faces[1] + " × 2 + " + faces[2] + " = " + last);
        } else {
            last = val[1] + val[2];
            eqs.add(faces[1] + " + " + faces[2] + " = " + last);
        }
        return new GeneratedTask("SYMBOLS", "SYMBOLS",
                String.join(", ", eqs) + " → " + faces[2] + " = ?", String.valueOf(val[2]));
    }

    // ---------- Тема BALANCE: весы и пропорции ----------

    private GeneratedTask balance(int lvl) {
        String[] units = lvl % 2 == 0 ? THINGS : ANIMALS;
        String a = units[0];
        String b = units[1];
        String c = units[2];
        int bVal = num(2, lvl >= 2 ? 12 : 8);
        return switch (lvl) {
            case 0 -> {
                // a = 2b, b = X → a = 2X
                int k = num(2, 3);
                yield new GeneratedTask("BALANCE", "BALANCE",
                        a + " = " + k + " " + b + ", " + b + " = " + bVal + " кг → " + a + " = ?",
                        String.valueOf(k * bVal));
            }
            case 1 -> {
                // a = 2b, b = 3c, c = X → a = 6X
                int k2 = num(2, 4);
                int k1 = num(2, 3);
                int cVal = num(1, 5);
                yield new GeneratedTask("BALANCE", "BALANCE",
                        a + " = " + k1 + " " + b + ", " + b + " = " + k2 + " " + c + ", "
                                + c + " = " + cVal + " кг → " + a + " = ?",
                        String.valueOf(k1 * k2 * cVal));
            }
            case 2 -> {
                // kb·a = ka·b, b = kb·k → a = ka·k (кратность гарантирует целый ответ)
                int ka = num(2, 5);
                int kb = num(2, 4);
                int k = num(1, 4);
                yield new GeneratedTask("BALANCE", "BALANCE",
                        kb + " " + a + " = " + ka + " " + b + ", " + b + " = " + (kb * k) + " кг → " + a + " = ?",
                        String.valueOf(ka * k));
            }
            case 3 -> {
                // kb·a = ka·b, a = ka·k → b = kb·k
                int ka = num(2, 5);
                int kb = num(2, 4);
                int k = num(1, 4);
                yield new GeneratedTask("BALANCE", "BALANCE",
                        kb + " " + a + " = " + ka + " " + b + ", " + a + " = " + (ka * k) + " кг → " + b + " = ?",
                        String.valueOf(kb * k));
            }
            default -> {
                // Цепочка из 4 звеньев: a = 2b, b = 2c, c = 3d, d = X → a = 12X
                int k1 = num(2, 3);
                int k2 = num(2, 3);
                int k3 = num(2, 4);
                int dVal = num(1, 4);
                yield new GeneratedTask("BALANCE", "BALANCE",
                        a + " = " + k1 + " " + b + ", " + b + " = " + k2 + " " + c + ", "
                                + c + " = " + k3 + " " + units[2] + ", " + units[2] + " = " + dVal + " кг → " + a + " = ?",
                        String.valueOf(k1 * k2 * k3 * dVal));
            }
        };
    }

    // ---------- Тема RIDDLE: текстовые логические загадки ----------

    private GeneratedTask riddle(int lvl) {
        return switch (lvl) {
            case 0 -> switch (RND.nextInt(2)) {
                case 0 -> {
                    int cats = num(3, 8);
                    int goats = num(2, 6);
                    yield r("Во дворе " + cats + " кошек (по 4 лапы) и " + goats + " куриц (по 2 лапы). "
                            + "Сколько всего лап?", String.valueOf(cats * 4 + goats * 2));
                }
                default -> {
                    int age = num(8, 16);
                    int diff = num(1, 5);
                    yield r("Кате " + age + " лет, её брат на " + diff + " года младше. Сколько лет брату?",
                            String.valueOf(age - diff));
                }
            };
            case 1 -> switch (RND.nextInt(2)) {
                case 0 -> {
                    int in = num(3, 9);
                    yield r("Через " + in + " лет Пете будет " + (num(10, 20) + in) + " лет. "
                            + "Сколько лет Пете сейчас?", null);
                }
                default -> {
                    int len = num(4, 10);
                    yield r("Бревно длиной " + len + " метров распилили на части по 1 метру. "
                            + "Сколько сделали распилов?", String.valueOf(len - 1));
                }
            };
            case 2 -> switch (RND.nextInt(2)) {
                case 0 -> {
                    int fromStart = num(2, 6);
                    int fromEnd = num(2, 6);
                    yield r("Вася стоит в очереди " + fromStart + "-й с начала и " + fromEnd + "-й с конца. "
                            + "Сколько всего человек в очереди?", String.valueOf(fromStart + fromEnd - 1));
                }
                default -> {
                    int diff = num(2, 6) * 2;
                    int sum = num(10, 20) * 2;
                    int pencil = (sum + diff) / 2;
                    yield r("Ручка дороже карандаша на " + diff + " руб. Вместе они стоят " + sum + " руб. "
                            + "Сколько стоит ручка?", String.valueOf(pencil));
                }
            };
            case 3 -> switch (RND.nextInt(2)) {
                case 0 -> {
                    int up = num(3, 6);
                    int down = num(1, up - 1);
                    int height = num(up + down, up + down * 3);
                    int days = (height - up) / (up - down) + 1;
                    yield r("Улитка за день поднимается по столбу на " + up + " дм, а за ночь сползает на "
                            + down + " дм. Столб высотой " + height + " дм. На какой день улитка доберётся до вершины?",
                            String.valueOf(days));
                }
                default -> {
                    int n = num(10, 24) * 2;
                    yield r("У Маши было " + n + " конфет. Она отдала подруге половину и ещё 3 конфеты. "
                            + "Сколько конфет отдала Маша?", String.valueOf(n / 2 + 3));
                }
            };
            default -> switch (RND.nextInt(2)) {
                case 0 -> {
                    int k = num(4, 9);
                    yield r("В классе " + k + " учеников. Каждый подарил по открытке всем остальным. "
                            + "Сколько всего открытек подарили?", String.valueOf(k * (k - 1)));
                }
                default -> {
                    int sum = num(4, 12) * 6;
                    yield r("Бабушке и внуку вместе " + sum + " лет. Бабушка старше внука в 5 раз. "
                            + "Сколько лет внуку?", String.valueOf(sum / 6));
                }
            };
        };
    }

    // ---------- Тема SEQUENCES: последовательности (дни, буквы, циклы) ----------

    private GeneratedTask sequences(int lvl) {
        String[] weekdays = {"понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье"};
        String[] months = {"январь", "февраль", "март", "апрель", "май", "июнь", "июль",
                "август", "сентябрь", "октябрь", "ноябрь", "декабрь"};
        int lvlSafe = Math.min(lvl, 4);
        return switch (lvlSafe) {
            case 0 -> {
                int idx = num(0, 3);
                int skip = num(2, 3);
                yield r("Сегодня " + weekdays[idx] + ". Какой день недели будет через " + skip + " дня?",
                        weekdays[(idx + skip) % 7]);
            }
            case 1 -> {
                int idx = num(0, 6);
                int skip = num(10, 30);
                yield r("Сегодня " + weekdays[idx] + ". Какой день недели будет через " + skip + " дней?",
                        weekdays[(idx + skip) % 7]);
            }
            case 2 -> {
                int idx = num(0, 7);
                int skip = num(3, 12);
                yield r("Сейчас " + months[idx] + ". Какой месяц наступит через " + skip + " месяцев?",
                        months[(idx + skip) % 12]);
            }
            case 3 -> {
                // Буквенный ряд с пропуском: А, В, Д, Ё, ? (пропущена одна буква)
                String[] letters = {"А", "Б", "В", "Г", "Д", "Е", "Ё", "Ж", "З", "И"};
                int skip = num(1, 2);
                int idx = num(0, 4);
                yield r("Буквы идут по алфавиту, но некоторые пропущены: "
                        + letters[idx] + ", " + letters[idx + skip] + ", " + letters[idx + skip * 2]
                        + ". Какая буква будет следующей?", letters[idx + skip * 3]);
            }
            default -> {
                // Циклический узор: 3 цвета повторяются, N-й элемент?
                String[] colors = {"🔴", "🟡", "🔵"};
                int skip = num(5, 20);
                yield r("Узор повторяется: 🔴 🟡 🔵 🔴 🟡 🔵 … Какого цвета будет " + skip + "-й элемент?",
                        colors[(skip - 1) % 3]);
            }
        };
    }

    // ---------- Вспомогательные ----------

    private GeneratedTask pat(List<Integer> row, String answer) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 4; i++) {
            sb.append(row.get(i)).append(", ");
        }
        sb.append("?");
        return new GeneratedTask("PATTERN", "PATTERN", "Продолжи ряд: " + sb, answer);
    }

    private GeneratedTask r(String text, String answer) {
        // Если ответ не задан — вычисляем по шаблону «Через N лет будет M»
        if (answer == null) {
            java.util.regex.Matcher m = java.util.regex.Pattern
                    .compile("Через (\\d+) лет Пете будет (\\d+) лет").matcher(text);
            if (m.find()) {
                answer = String.valueOf(Integer.parseInt(m.group(2)) - Integer.parseInt(m.group(1)));
            } else {
                answer = "0";
            }
        }
        return new GeneratedTask("RIDDLE", "RIDDLE", text, answer);
    }

    private List<Integer> arith(int start, int step, int count) {
        List<Integer> out = new ArrayList<>();
        int v = start;
        for (int i = 0; i < count; i++) {
            out.add(v);
            v += step;
        }
        return out;
    }

    private static String trimInt(double v) {
        int rounded = (int) Math.round(v);
        return String.valueOf(rounded);
    }

    private static int num(int min, int max) {
        if (max <= min) {
            return min;
        }
        return RND.nextInt(min, max + 1);
    }
}
