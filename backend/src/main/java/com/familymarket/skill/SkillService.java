package com.familymarket.skill;

import com.familymarket.achievement.Achievement;
import com.familymarket.achievement.AchievementRepository;
import com.familymarket.achievement.AchievementService;
import com.familymarket.achievement.ChildAchievementRepository;
import com.familymarket.child.ChildRepository;
import com.familymarket.common.NotFoundException;
import com.familymarket.dto.SkillProgressDto;
import com.familymarket.house.HouseDayRepository;
import com.familymarket.math.MathAttemptRepository;
import com.familymarket.reading.ReadingLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Расчёт прогресса 6 направлений развития (Skill Hexagon).
 * Значение 0..100 складывается из активности ребёнка и прогресса достижений по навыку.
 */
@Service
public class SkillService {

    public record SkillMeta(String skill, String name, String icon) {
    }

    private static final List<SkillMeta> SKILLS = List.of(
            new SkillMeta("MATH", "Математика", "🧮"),
            new SkillMeta("READING", "Чтение", "📚"),
            new SkillMeta("LOGIC", "Логика", "🧩"),
            new SkillMeta("LANG", "Иностранный язык", "🌍"),
            new SkillMeta("SPORT", "Спорт и хобби", "⚽"),
            new SkillMeta("HOUSE", "Порядок в комнате", "🏠"));

    private final ChildRepository childRepository;
    private final AchievementRepository achievementRepository;
    private final ChildAchievementRepository childAchievementRepository;
    private final ReadingLogRepository readingLogRepository;
    private final MathAttemptRepository mathAttemptRepository;
    private final HouseDayRepository houseDayRepository;
    private final AchievementService achievementService;

    public SkillService(ChildRepository childRepository,
                        AchievementRepository achievementRepository,
                        ChildAchievementRepository childAchievementRepository,
                        ReadingLogRepository readingLogRepository,
                        MathAttemptRepository mathAttemptRepository,
                        HouseDayRepository houseDayRepository,
                        AchievementService achievementService) {
        this.childRepository = childRepository;
        this.achievementRepository = achievementRepository;
        this.childAchievementRepository = childAchievementRepository;
        this.readingLogRepository = readingLogRepository;
        this.mathAttemptRepository = mathAttemptRepository;
        this.houseDayRepository = houseDayRepository;
        this.achievementService = achievementService;
    }

    @Transactional(readOnly = true)
    public List<SkillProgressDto> progress(Long childId) {
        Long parentId = childRepository.findParentIdById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));

        // Активность ребёнка
        long booksRead = readingLogRepository.countApprovedByChildId(childId);
        long pagesRead = readingLogRepository.sumPagesByChildId(childId);
        long mathCorrect = mathAttemptRepository.countCorrectByChildId(childId);
        long housePositive = houseDayRepository.findCleanRoomDays(childId).size()
                + houseDayRepository.findHelpDays(childId).size();

        // Достижения родителя, сгруппированные по навыку
        Map<String, List<Achievement>> bySkill = new LinkedHashMap<>();
        for (Achievement achievement : achievementRepository.findByParentIdOrderByCreatedAtAsc(parentId)) {
            String skill = achievement.getSkill();
            if (skill == null) {
                continue;
            }
            bySkill.computeIfAbsent(skill, k -> new ArrayList<>()).add(achievement);
        }

        List<SkillProgressDto> result = new ArrayList<>();
        for (SkillMeta meta : SKILLS) {
            List<Achievement> achievements = bySkill.getOrDefault(meta.skill(), List.of());
            long unlocked = childAchievementRepository.countByChildIdAndAchievementIdIn(
                    childId, achievements.stream().map(Achievement::getId).toList());

            // Достиженческая часть: максимальный прогресс по группам уровней (0..60)
            double achievementScore = achievementScore(childId, achievements);

            // Активностная часть (0..40)
            double activityScore = switch (meta.skill()) {
                case "MATH" -> Math.min(40, mathCorrect * 2.0);
                case "READING" -> Math.min(40, booksRead * 2.0 + pagesRead / 200.0);
                case "HOUSE" -> Math.min(40, housePositive * 1.5);
                default -> 0;
            };

            long xp = Math.round(achievementScore + activityScore);
            int progress = (int) Math.min(100, xp);
            result.add(new SkillProgressDto(meta.skill(), meta.name(), meta.icon(), progress, xp, unlocked));
        }
        return result;
    }

    /**
     * Максимальный прогресс по группам уровней достижений навыка (0..60).
     */
    private double achievementScore(Long childId, List<Achievement> achievements) {
        if (achievements.isEmpty()) {
            return 0;
        }
        Map<String, List<Achievement>> groups = new LinkedHashMap<>();
        for (Achievement achievement : achievements) {
            String key = achievement.getGroupKey() == null
                    ? "single-" + achievement.getId()
                    : achievement.getGroupKey();
            groups.computeIfAbsent(key, k -> new ArrayList<>()).add(achievement);
        }
        double best = 0;
        for (List<Achievement> group : groups.values()) {
            group.sort(Comparator.comparingInt(Achievement::getLevel));
            double groupScore = 0;
            for (Achievement achievement : group) {
                if (achievement.getTargetValue() <= 0) {
                    continue;
                }
                long progress = achievementService.progressFor(achievement, childId);
                double ratio = Math.min(1.0, (double) progress / achievement.getTargetValue());
                groupScore = Math.max(groupScore, ratio);
            }
            best = Math.max(best, groupScore);
        }
        return best * 60;
    }
}
