package com.familymarket.langcard;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

/**
 * Генератор задач языка из активных слов словаря ребёнка.
 * Ручные задания (DECODE / SHARE_SECRET / MASTERY) создаются из шаблонов и пула
 * повседневных вопросов — их проверяет родитель с множителем 0/1/2.
 */
@Component
public class LangTaskGenerator {

    public record GeneratedTask(LangTaskType taskType, String text, String answer, Long wordId) {
    }

    private static final Random RND = new Random();

    /** Шаблоны «Тайных историй»: одно предложение с пропуском ___ (ответ en|ru). */
    private static final String[] STORY_TEMPLATES = {
            "This morning I saw a ___.",
            "Yesterday my friend gave me a ___.",
            "In the evening I like to ___ with my family.",
            "My favourite thing at home is the ___.",
            "On Sunday we went to the park and saw a ___.",
            "Every day I drink ___ for breakfast.",
            "There is a big ___ near my house.",
            "After school I usually play with my ___."
    };

    /** Шаблоны «Расшифруй послание»: короткие тексты с пропусками активных слов. */
    private static final String[] DECODE_TEMPLATES = {
            "Hi! My name is Tom. I live in a small %s with my family. Every morning I drink %s and eat bread. "
                    + "After school I like to %s with my friends. My favourite season is %s because the weather is warm.",
            "Dear friend! Yesterday was a great day. I visited my %s and we played in the %s. "
                    + "The weather was sunny, but in the evening there was %s. I want to go there again!",
            "Hello! I want to tell you about my %s. It is very %s and interesting. My %s says that I "
                    + "read many books about it. I think it is important to %s every day.",
            "Hi! Last winter my family and I went on a journey. We travelled by %s to a big %s. "
                    + "There was a lot of %s and it was very cold. But we were happy and had a lot of fun!"
    };

    /** Пул повседневных вопросов: [0] — русский, [1] — английский. */
    private static final String[][] QUESTIONS = {
            {"Что ты ел на завтрак?", "What did you eat for breakfast?"},
            {"Как прошёл твой день?", "How was your day?"},
            {"Что ты пил утром?", "What did you drink in the morning?"},
            {"Какая на улице погода?", "What is the weather like outside?"},
            {"Что ты делал в школе?", "What did you do at school?"},
            {"Во что ты любишь играть?", "What games do you like to play?"},
            {"Какая твоя любимая книга?", "What is your favourite book?"},
            {"О чём ты мечтаешь?", "What do you dream about?"},
            {"Кого ты видел сегодня?", "Who did you see today?"},
            {"Что нового случилось сегодня?", "What new happened today?"},
            {"Что ты делаешь по вечерам?", "What do you do in the evenings?"},
            {"Куда ты хочешь поехать летом?", "Where do you want to go in summer?"}
    };

    /**
     * Авто-задачи по активным словам: WORD_WALL (en→ru), SPELLING (ru→en),
     * SECRET_STORIES (предложение с пропуском, ответ "en|ru").
     */
    public List<GeneratedTask> autoTasks(LangTaskType type, List<LangWord> words, LangDifficulty difficulty) {
        if (words.isEmpty()) {
            return List.of(new GeneratedTask(type,
                    "Словарь пуст — попроси родителя активировать слова в настройках навыка", "", null));
        }
        List<LangWord> pool = new ArrayList<>(words);
        Collections.shuffle(pool);
        int count = Math.min(type.getTaskCount(), pool.size());
        List<GeneratedTask> out = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            LangWord w = pool.get(i);
            out.add(switch (type) {
                case WORD_WALL -> new GeneratedTask(type,
                        "Переведи на русский: " + w.getForeignText(), w.getRuText(), w.getId());
                case SPELLING -> new GeneratedTask(type,
                        "Напиши по-английски: " + w.getRuText(), w.getForeignText(), w.getId());
                case SECRET_STORIES -> {
                    String tpl = STORY_TEMPLATES[RND.nextInt(STORY_TEMPLATES.length)];
                    yield new GeneratedTask(type, tpl, w.getForeignText() + "|" + w.getRuText(), w.getId());
                }
                default -> new GeneratedTask(type, "", "", null);
            });
        }
        return out;
    }

    /** Ручные задания: DECODE (текст с активными словами), SHARE_SECRET (вопрос ru), MASTERY (вопрос en). */
    public List<GeneratedTask> manualTasks(LangTaskType type, List<LangWord> words) {
        return switch (type) {
            case DECODE -> {
                String tpl = DECODE_TEMPLATES[RND.nextInt(DECODE_TEMPLATES.length)];
                String text = fillTemplate(tpl, words);
                yield List.of(new GeneratedTask(type, "Прочитай текст и опиши по-русски, что в нём написано:\n\n" + text, "", null));
            }
            case SHARE_SECRET -> List.of(pickQuestions(type, words, true));
            case MASTERY -> List.of(pickQuestions(type, words, false));
            default -> List.of();
        };
    }

    private GeneratedTask pickQuestions(LangTaskType type, List<LangWord> words, boolean russian) {
        StringBuilder sb = new StringBuilder();
        int count = Math.min(2, QUESTIONS.length);
        int start = RND.nextInt(QUESTIONS.length - count);
        for (int i = 0; i < count; i++) {
            String[] q = QUESTIONS[start + i];
            if (i > 0) {
                sb.append("\n");
            }
            sb.append(i + 1).append(") ").append(russian ? q[0] : q[1]);
        }
        String hint = russian
                ? "Ответь на английском языке:"
                : "Прочитай задание на английском и ответь на английском языке:";
        return new GeneratedTask(type, hint + "\n\n" + sb, "", null);
    }

    /** Подстановка активных слов в шаблон текста. */
    private String fillTemplate(String tpl, List<LangWord> words) {
        List<LangWord> pool = new ArrayList<>(words);
        Collections.shuffle(pool);
        StringBuilder sb = new StringBuilder();
        int idx = 0;
        for (int i = 0; i < tpl.length(); i++) {
            char c = tpl.charAt(i);
            if (c == '%' && i + 1 < tpl.length() && tpl.charAt(i + 1) == 's' && !pool.isEmpty()) {
                sb.append(pool.get(idx % pool.size()).getForeignText());
                idx++;
                i++;
            } else {
                sb.append(c);
            }
        }
        return sb.toString();
    }
}
