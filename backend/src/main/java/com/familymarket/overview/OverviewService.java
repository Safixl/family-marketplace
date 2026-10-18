package com.familymarket.overview;

import com.familymarket.balance.BalanceService;
import com.familymarket.child.Child;
import com.familymarket.child.ChildRepository;
import com.familymarket.daily.DailyService;
import com.familymarket.dto.BalanceRowDto;
import com.familymarket.dto.OverviewChildDto;
import com.familymarket.dto.QuestDto;
import com.familymarket.limit.LimitService;
import com.familymarket.quest.ChildQuestState;
import com.familymarket.quest.ChildQuestStateRepository;
import com.familymarket.quest.QuestRepository;
import com.familymarket.skill.SkillActivationRepository;
import com.familymarket.skill.SkillService;
import com.familymarket.xp.XpService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Агрегированный обзор для родителя: по одному запросу возвращает всё,
 * что нужно для карточки ребёнка во вкладке «Обзор».
 */
@Service
public class OverviewService {

    private final ChildRepository childRepository;
    private final BalanceService balanceService;
    private final LimitService limitService;
    private final XpService xpService;
    private final SkillService skillService;
    private final DailyService dailyService;
    private final QuestRepository questRepository;
    private final ChildQuestStateRepository childQuestStateRepository;
    private final SkillActivationRepository skillActivationRepository;

    public OverviewService(ChildRepository childRepository,
                           BalanceService balanceService,
                           LimitService limitService,
                           XpService xpService,
                           SkillService skillService,
                           DailyService dailyService,
                           QuestRepository questRepository,
                           ChildQuestStateRepository childQuestStateRepository,
                           SkillActivationRepository skillActivationRepository) {
        this.childRepository = childRepository;
        this.balanceService = balanceService;
        this.limitService = limitService;
        this.xpService = xpService;
        this.skillService = skillService;
        this.dailyService = dailyService;
        this.questRepository = questRepository;
        this.childQuestStateRepository = childQuestStateRepository;
        this.skillActivationRepository = skillActivationRepository;
    }

    @Transactional
    public List<OverviewChildDto> overview(Long parentId) {
        List<Child> children = childRepository.findByParentIdOrderByCreatedAtAsc(parentId);
        List<BalanceRowDto> allBalances = balanceService.listForParent(parentId);
        return children.stream()
                .filter(Child::isActive)
                .map(child -> build(parentId, child, allBalances))
                .toList();
    }

    private OverviewChildDto build(Long parentId, Child child, List<BalanceRowDto> allBalances) {
        Long childId = child.getId();
        List<BalanceRowDto> balances = allBalances.stream()
                .filter(b -> b.childId().equals(childId))
                .toList();

        // Активные квесты ребёнка: стадии ACTIVE (в работе) и SUBMITTED (на проверке)
        Map<Long, ChildQuestState> states = childQuestStateRepository.findByChildId(childId).stream()
                .collect(Collectors.toMap(s -> s.getQuest().getId(), Function.identity()));
        List<QuestDto> activeQuests = questRepository.findActiveForChild(parentId, childId).stream()
                .filter(q -> {
                    ChildQuestState state = states.get(q.getId());
                    return state != null && List.of("ACTIVE", "SUBMITTED").contains(state.getStatus());
                })
                .map(q -> QuestDto.from(q, states.get(q.getId())))
                .toList();

        List<String> activatedSkills = skillActivationRepository.findByChildId(childId).stream()
                .map(a -> a.getSkill())
                .toList();

        return new OverviewChildDto(
                childId,
                child.getName(),
                child.getAvatarEmoji(),
                child.getAge(),
                child.isActive(),
                xpService.level(childId),
                balances,
                limitService.getState(childId),
                activeQuests,
                dailyService.state(childId).skills(),
                skillService.progress(childId),
                activatedSkills);
    }
}