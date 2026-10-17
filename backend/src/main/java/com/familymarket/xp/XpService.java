package com.familymarket.xp;

import com.familymarket.achievement.AchievementRepository;
import com.familymarket.achievement.ChildAchievementRepository;
import com.familymarket.child.ChildRepository;
import com.familymarket.common.NotFoundException;
import com.familymarket.dto.LevelDto;
import com.familymarket.quest.QuestSubmissionRepository;
import com.familymarket.skill.SkillService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Общий уровень персонажа (в стиле MMORPG):
 * XP = 50% от опыта навыков + опыт ачивок (xp_reward) + опыт квестов ГМа (одобренные заявки).
 *
 * Прогрессия 1..60 с потолком на 60-м уровне (Чемпион, финальная точка ~5 лет игры).
 * Та же кривая опыта используется и для уровней отдельных навыков.
 */
@Service
public class XpService {

    /** Максимальный уровень (потолок прогрессии). */
    private static final int MAX_LEVEL = 60;

    /**
     * Опыт для перехода с уровня N на N+1 (индекс N-1).
     * От 42 XP на 1→2 до 5186 XP на 59→60. Итого путь 1→60 = 109 560 XP ≈ 5 лет игры (~60 XP/день).
     */
    private static final long[] XP_CURVE = {
            42, 48, 58, 71, 87,
            107, 130, 155, 184, 216,
            251, 289, 330, 374, 421,
            471, 523, 579, 637, 698,
            762, 829, 899, 971, 1046,
            1124, 1204, 1288, 1374, 1462,
            1554, 1648, 1745, 1844, 1947,
            2051, 2159, 2269, 2382, 2497,
            2615, 2736, 2859, 2985, 3113,
            3245, 3378, 3514, 3653, 3795,
            3939, 4085, 4234, 4386, 4540,
            4697, 4856, 5018, 5186};

    private static final List<Rank> RANKS = List.of(
            new Rank(1, "Дерево", "🌳"),
            new Rank(6, "Железо", "⚙️"),
            new Rank(12, "Бронза", "🥉"),
            new Rank(18, "Серебро", "🥈"),
            new Rank(24, "Золото", "🥇"),
            new Rank(30, "Платина", "🛡️"),
            new Rank(36, "Изумруд", "💚"),
            new Rank(42, "Алмаз", "💎"),
            new Rank(48, "Мастер", "🎓"),
            new Rank(52, "Гранд-мастер", "👑"),
            new Rank(60, "Чемпион", "🏆"));

    private record Rank(int minLevel, String name, String emoji) {
    }

    private final ChildRepository childRepository;
    private final SkillService skillService;
    private final AchievementRepository achievementRepository;
    private final ChildAchievementRepository childAchievementRepository;
    private final QuestSubmissionRepository questSubmissionRepository;

    public XpService(ChildRepository childRepository,
                     SkillService skillService,
                     AchievementRepository achievementRepository,
                     ChildAchievementRepository childAchievementRepository,
                     QuestSubmissionRepository questSubmissionRepository) {
        this.childRepository = childRepository;
        this.skillService = skillService;
        this.achievementRepository = achievementRepository;
        this.childAchievementRepository = childAchievementRepository;
        this.questSubmissionRepository = questSubmissionRepository;
    }

    @Transactional(readOnly = true)
    public LevelDto level(Long childId) {
        long parentId = childRepository.findParentIdById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));

        // 50% опыта навыков
        long skillXp = Math.round(skillService.progress(childId).stream()
                .mapToDouble(s -> s.xp())
                .sum() * 0.5);

        // Опыт ачивок (разблокированные)
        long achievementXp = achievementRepository.findByParentIdOrderByCreatedAtAsc(parentId).stream()
                .filter(a -> a.getXpReward() > 0)
                .filter(a -> childAchievementRepository
                        .findByChildIdAndAchievementId(childId, a.getId()).isPresent())
                .mapToLong(a -> a.getXpReward())
                .sum();

        // Опыт квестов ГМа (одобренные заявки)
        long questXp = questSubmissionRepository.sumXpByChildId(childId);

        long totalXp = skillXp + achievementXp + questXp;
        return toLevelDto(totalXp);
    }

    public static LevelDto toLevelDto(long xp) {
        int level = 1;
        long remaining = Math.max(0, xp);
        while (level < MAX_LEVEL && remaining >= xpForLevel(level)) {
            remaining -= xpForLevel(level);
            level++;
        }
        boolean capped = level >= MAX_LEVEL;
        long xpToNext = capped ? 0 : xpForLevel(level);
        final int currentLevel = level;
        Rank rank = RANKS.stream().filter(r -> r.minLevel() <= currentLevel).reduce((a, b) -> b).orElse(RANKS.get(0));
        double ratio = capped || xpToNext <= 0 ? 1.0 : Math.min(1.0, (double) remaining / xpToNext);
        return new LevelDto(xp, level, capped ? 0 : remaining, xpToNext, ratio, rank.name(), rank.emoji());
    }

    private static long xpForLevel(int level) {
        if (level < 1) return XP_CURVE[0];
        if (level >= MAX_LEVEL) return 0;
        return XP_CURVE[level - 1];
    }
}
