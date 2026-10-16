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
 * Уровень открывает бонусы (+% золота, доступ к товарам) — настраивается на фронтенде.
 */
@Service
public class XpService {

    private static final List<Rank> RANKS = List.of(
            new Rank(0, "Новичок", "🌱"),
            new Rank(3, "Ученик", "📖"),
            new Rank(6, "Подмастерье", "🛠️"),
            new Rank(10, "Ремесленник", "⚒️"),
            new Rank(15, "Эксперт", "🎓"),
            new Rank(21, "Мастер", "🏅"),
            new Rank(28, "Гроссмейстер", "👑"),
            new Rank(36, "Легенда", "🌟"));

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
        while (remaining >= xpForLevel(level)) {
            remaining -= xpForLevel(level);
            level++;
        }
        long xpToNext = xpForLevel(level);
        final int currentLevel = level;
        Rank rank = RANKS.stream().filter(r -> r.minLevel() <= currentLevel).reduce((a, b) -> b).orElse(RANKS.get(0));
        double ratio = xpToNext > 0 ? Math.min(1.0, (double) remaining / xpToNext) : 1.0;
        return new LevelDto(xp, level, remaining, xpToNext, ratio, rank.name(), rank.emoji());
    }

    private static long xpForLevel(int level) {
        return 100 + (level - 1) * 50L;
    }
}
