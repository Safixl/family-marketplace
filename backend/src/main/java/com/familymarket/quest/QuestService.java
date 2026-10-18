package com.familymarket.quest;

import com.familymarket.balance.BalanceService;
import com.familymarket.child.Child;
import com.familymarket.child.ChildRepository;
import com.familymarket.common.BadRequestException;
import com.familymarket.common.NotFoundException;
import com.familymarket.dto.QuestDto;
import com.familymarket.dto.QuestSubmissionDto;
import com.familymarket.dto.QuestSubmitRequest;
import com.familymarket.dto.QuestUpsertRequest;
import com.familymarket.seasonal.SeasonalEvent;
import com.familymarket.seasonal.SeasonalEventRepository;
import com.familymarket.store.Store;
import com.familymarket.store.StoreRepository;
import com.familymarket.user.User;
import com.familymarket.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Пул квестов ГМа: Дейлики (повторяемые), Сюжетные (разовые) и Сезонные.
 *
 * Стадии квеста для ребёнка:
 *  - AVAILABLE (!) — доступен для принятия, видно базовое описание;
 *  - ACTIVE (?) — взят, видно описание выполнения и таймер (если задан);
 *  - SUBMITTED — отправлен на проверку;
 *  - DONE — одноразовый выполнен (скрывается из списка);
 *  - SLEEPING — повторяемый после одобрения, ожидание повторного взятия (cooldown).
 */
@Service
public class QuestService {

    private final QuestRepository questRepository;
    private final QuestSubmissionRepository submissionRepository;
    private final ChildQuestStateRepository childQuestStateRepository;
    private final ChildRepository childRepository;
    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final SeasonalEventRepository seasonalEventRepository;
    private final BalanceService balanceService;

    public QuestService(QuestRepository questRepository,
                        QuestSubmissionRepository submissionRepository,
                        ChildQuestStateRepository childQuestStateRepository,
                        ChildRepository childRepository,
                        UserRepository userRepository,
                        StoreRepository storeRepository,
                        SeasonalEventRepository seasonalEventRepository,
                        BalanceService balanceService) {
        this.questRepository = questRepository;
        this.submissionRepository = submissionRepository;
        this.childQuestStateRepository = childQuestStateRepository;
        this.childRepository = childRepository;
        this.userRepository = userRepository;
        this.storeRepository = storeRepository;
        this.seasonalEventRepository = seasonalEventRepository;
        this.balanceService = balanceService;
    }

    // ---------- Родитель: пул квестов ----------

    @Transactional(readOnly = true)
    public List<QuestDto> listForParent(Long parentId) {
        return questRepository.findByParentIdOrderByCreatedAtDesc(parentId)
                .stream().map(this::toParentDto).toList();
    }

    /** Для родителя: квест + счётчики активных и завершённых детей. */
    private QuestDto toParentDto(Quest quest) {
        List<ChildQuestState> states = childQuestStateRepository.findByQuestId(quest.getId());
        long active = states.stream()
                .filter(s -> "ACTIVE".equals(s.getStatus()) || "SUBMITTED".equals(s.getStatus()))
                .count();
        long done = states.stream().filter(s -> "DONE".equals(s.getStatus())).count();
        return QuestDto.from(quest, active, done);
    }

    @Transactional
    public QuestDto create(Long parentId, QuestUpsertRequest request) {
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));
        Quest quest = new Quest();
        quest.setParent(parent);
        applyRequest(quest, request);
        quest.setCreatedAt(Instant.now());
        return QuestDto.from(questRepository.save(quest));
    }

    @Transactional
    public QuestDto update(Long parentId, Long questId, QuestUpsertRequest request) {
        Quest quest = getOwned(parentId, questId);
        applyRequest(quest, request);
        return QuestDto.from(questRepository.save(quest));
    }

    @Transactional
    public void delete(Long parentId, Long questId) {
        questRepository.delete(getOwned(parentId, questId));
    }

    private void applyRequest(Quest quest, QuestUpsertRequest request) {
        if (request.title() != null) {
            quest.setTitle(request.title().trim());
        }
        if (request.description() != null) {
            quest.setDescription(request.description());
        }
        if (request.basicDescription() != null) {
            quest.setBasicDescription(request.basicDescription());
        }
        if (request.acceptDescription() != null) {
            quest.setAcceptDescription(request.acceptDescription());
        }
        if (request.durationMinutes() != null) {
            quest.setDurationMinutes(request.durationMinutes());
        }
        if (request.cooldownHours() != null) {
            quest.setCooldownHours(request.cooldownHours());
        }
        if (request.icon() != null && !request.icon().isBlank()) {
            quest.setIcon(request.icon().trim());
        }
        if (request.type() != null) {
            quest.setType(normalizeType(request.type()));
        }
        if (request.childId() != null) {
            quest.setChild(childRepository.findById(request.childId())
                    .orElseThrow(() -> new NotFoundException("Ребенок не найден")));
        }
        if (request.rewardStoreId() != null) {
            quest.setRewardStore(storeRepository.findByIdAndParentId(request.rewardStoreId(), quest.getParent().getId())
                    .orElseThrow(() -> new NotFoundException("Магазин не найден")));
        }
        if (request.rewardAmount() != null) {
            quest.setRewardAmount(request.rewardAmount());
        }
        if (request.xpReward() != null) {
            quest.setXpReward(request.xpReward());
        }
        if (request.seasonalEventId() != null) {
            quest.setSeasonalEvent(seasonalEventRepository.findById(request.seasonalEventId())
                    .orElseThrow(() -> new NotFoundException("Ивент не найден")));
            quest.setType("SEASONAL");
        }
        if (request.repeatable() != null) {
            quest.setRepeatable(request.repeatable());
        }
        if (request.active() != null) {
            quest.setActive(request.active());
        }
    }

    // ---------- Ребёнок: активные квесты и сабмиты ----------

    @Transactional(readOnly = true)
    public List<QuestDto> listActiveForChild(Long childId) {
        Long parentId = childRepository.findParentIdById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        List<Quest> quests = questRepository.findActiveForChild(parentId, childId);
        Map<Long, ChildQuestState> states = childQuestStateRepository.findByChildId(childId).stream()
                .collect(Collectors.toMap(s -> s.getQuest().getId(), Function.identity()));
        return quests.stream()
                // одноразовые выполненные квесты скрываем
                .filter(q -> {
                    ChildQuestState state = states.get(q.getId());
                    return state == null || !"DONE".equals(state.getStatus());
                })
                .map(q -> QuestDto.from(q, states.get(q.getId())))
                .toList();
    }

    /**
     * Взять квест: AVAILABLE (!) → ACTIVE (?). Для повторяемых проверяется
     * время повторного взятия (SLEEPING).
     */
    @Transactional
    public void accept(Long childId, Long questId) {
        Quest quest = questRepository.findById(questId)
                .orElseThrow(() -> new NotFoundException("Квест не найден"));
        if (!quest.isActive()) {
            throw new BadRequestException("Квест неактивен");
        }
        if (quest.getChild() != null && !quest.getChild().getId().equals(childId)) {
            throw new NotFoundException("Квест не найден");
        }
        ChildQuestState state = childQuestStateRepository.findByChildIdAndQuestId(childId, questId)
                .orElseGet(() -> {
                    ChildQuestState s = new ChildQuestState();
                    s.setChild(childRepository.getReferenceById(childId));
                    s.setQuest(quest);
                    return s;
                });
        Instant now = Instant.now();
        if ("SLEEPING".equals(state.getStatus())
                && state.getNextAvailableAt() != null
                && state.getNextAvailableAt().isAfter(now)) {
            throw new BadRequestException("Квест ещё не готов к повторному взятию");
        }
        if ("DONE".equals(state.getStatus())) {
            throw new BadRequestException("Квест уже выполнен");
        }
        if ("ACTIVE".equals(state.getStatus()) || "SUBMITTED".equals(state.getStatus())) {
            throw new BadRequestException("Квест уже взят");
        }
        state.setStatus("ACTIVE");
        state.setAcceptedAt(now);
        state.setStartsAt(now);
        state.setNextAvailableAt(null);
        childQuestStateRepository.save(state);
    }

    @Transactional
    public QuestSubmissionDto submit(Long childId, Long questId, QuestSubmitRequest request) {
        Quest quest = questRepository.findById(questId)
                .orElseThrow(() -> new NotFoundException("Квест не найден"));
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        if (!quest.isActive()) {
            throw new BadRequestException("Квест неактивен");
        }
        if (quest.getChild() != null && !quest.getChild().getId().equals(childId)) {
            throw new NotFoundException("Квест не найден");
        }
        ChildQuestState state = childQuestStateRepository.findByChildIdAndQuestId(childId, questId).orElse(null);
        Instant now = Instant.now();
        if (state != null) {
            if ("SUBMITTED".equals(state.getStatus())) {
                throw new BadRequestException("Заявка на этот квест уже ожидает подтверждения");
            }
            if ("DONE".equals(state.getStatus())) {
                throw new BadRequestException("Квест уже выполнен");
            }
            if ("SLEEPING".equals(state.getStatus())
                    && state.getNextAvailableAt() != null
                    && state.getNextAvailableAt().isAfter(now)) {
                throw new BadRequestException("Квест ещё не готов к повторному взятию");
            }
        }
        if (!quest.isRepeatable() && submissionRepository.existsByQuestIdAndChildIdAndStatus(questId, childId, "PENDING")) {
            throw new BadRequestException("Заявка на этот квест уже ожидает подтверждения");
        }
        QuestSubmission submission = new QuestSubmission();
        submission.setQuest(quest);
        submission.setChild(child);
        submission.setStatus("PENDING");
        submission.setComment(request.comment());
        submission.setPhotoUrl(request.photoUrl());
        submission.setCreatedAt(now);
        QuestSubmission saved = submissionRepository.save(submission);

        if (state == null) {
            state = new ChildQuestState();
            state.setChild(child);
            state.setQuest(quest);
        }
        state.setStatus("SUBMITTED");
        childQuestStateRepository.save(state);
        return QuestSubmissionDto.from(saved);
    }

    @Transactional(readOnly = true)
    public List<QuestSubmissionDto> mySubmissions(Long childId) {
        return submissionRepository.findByChildIdOrderByCreatedAtDesc(childId)
                .stream().map(QuestSubmissionDto::from).toList();
    }

    // ---------- Родитель: лента верификации ----------

    @Transactional(readOnly = true)
    public List<QuestSubmissionDto> listSubmissions(Long parentId, String status) {
        if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) {
            return submissionRepository.findByParentId(parentId)
                    .stream().map(QuestSubmissionDto::from).toList();
        }
        return submissionRepository.findByParentIdAndStatus(parentId, status)
                .stream().map(QuestSubmissionDto::from).toList();
    }

    /**
     * Одобрение заявки: начисляется награда квеста (валюта магазина + сезонные жетоны).
     * Одноразовый квест → DONE (скрывается), повторяемый → SLEEPING с cooldown.
     */
    @Transactional
    public QuestSubmissionDto approve(Long parentId, Long submissionId) {
        QuestSubmission submission = getOwnedSubmission(parentId, submissionId);
        if (!"PENDING".equals(submission.getStatus())) {
            throw new BadRequestException("Заявка уже обработана");
        }
        Quest quest = submission.getQuest();
        if (quest.getRewardStore() != null && quest.getRewardAmount().signum() > 0) {
            balanceService.credit(submission.getChild().getId(), quest.getRewardStore().getId(), quest.getRewardAmount());
        }
        submission.setStatus("APPROVED");
        submission.setResolvedAt(Instant.now());
        QuestSubmissionDto dto = QuestSubmissionDto.from(submissionRepository.save(submission));

        Long childId = submission.getChild().getId();
        childQuestStateRepository.findByChildIdAndQuestId(childId, quest.getId()).ifPresent(state -> {
            Instant now = Instant.now();
            if (quest.isRepeatable()) {
                if (quest.getCooldownHours() > 0) {
                    state.setStatus("SLEEPING");
                    state.setNextAvailableAt(now.plus(quest.getCooldownHours(), ChronoUnit.HOURS));
                } else {
                    state.setStatus("AVAILABLE");
                    state.setNextAvailableAt(null);
                }
            } else {
                state.setStatus("DONE");
                state.setCompletedAt(now);
            }
            childQuestStateRepository.save(state);
        });
        return dto;
    }

    @Transactional
    public QuestSubmissionDto reject(Long parentId, Long submissionId) {
        QuestSubmission submission = getOwnedSubmission(parentId, submissionId);
        if (!"PENDING".equals(submission.getStatus())) {
            throw new BadRequestException("Заявка уже обработана");
        }
        submission.setStatus("REJECTED");
        submission.setResolvedAt(Instant.now());
        QuestSubmissionDto dto = QuestSubmissionDto.from(submissionRepository.save(submission));

        // Возвращаем квест в работу (стадия ?)
        childQuestStateRepository
                .findByChildIdAndQuestId(submission.getChild().getId(), submission.getQuest().getId())
                .ifPresent(state -> {
                    if ("SUBMITTED".equals(state.getStatus())) {
                        state.setStatus("ACTIVE");
                        childQuestStateRepository.save(state);
                    }
                });
        return dto;
    }

    private Quest getOwned(Long parentId, Long questId) {
        return questRepository.findById(questId)
                .filter(q -> q.getParent().getId().equals(parentId))
                .orElseThrow(() -> new NotFoundException("Квест не найден"));
    }

    private QuestSubmission getOwnedSubmission(Long parentId, Long submissionId) {
        return submissionRepository.findById(submissionId)
                .filter(s -> s.getQuest().getParent().getId().equals(parentId))
                .orElseThrow(() -> new NotFoundException("Заявка не найдена"));
    }

    private String normalizeType(String type) {
        String normalized = type.trim().toUpperCase();
        return switch (normalized) {
            case "DAILY", "STORY", "SEASONAL" -> normalized;
            default -> "STORY";
        };
    }
}
