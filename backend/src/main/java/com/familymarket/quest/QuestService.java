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
import java.util.List;

/**
 * Пул квестов ГМа: Дейлики (повторяемые), Сюжетные (разовые) и Сезонные.
 * Ребёнок отправляет заявку («Выполнено» + фото/комментарий), родитель подтверждает —
 * начисляется награда: валюта магазина + опыт + сезонные жетоны.
 */
@Service
public class QuestService {

    private final QuestRepository questRepository;
    private final QuestSubmissionRepository submissionRepository;
    private final ChildRepository childRepository;
    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final SeasonalEventRepository seasonalEventRepository;
    private final BalanceService balanceService;

    public QuestService(QuestRepository questRepository,
                        QuestSubmissionRepository submissionRepository,
                        ChildRepository childRepository,
                        UserRepository userRepository,
                        StoreRepository storeRepository,
                        SeasonalEventRepository seasonalEventRepository,
                        BalanceService balanceService) {
        this.questRepository = questRepository;
        this.submissionRepository = submissionRepository;
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
                .stream().map(QuestDto::from).toList();
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
        return questRepository.findActiveForChild(parentId, childId)
                .stream().map(QuestDto::from).toList();
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
        if (!quest.isRepeatable() && submissionRepository.existsByQuestIdAndChildIdAndStatus(questId, childId, "PENDING")) {
            throw new BadRequestException("Заявка на этот квест уже ожидает подтверждения");
        }
        QuestSubmission submission = new QuestSubmission();
        submission.setQuest(quest);
        submission.setChild(child);
        submission.setStatus("PENDING");
        submission.setComment(request.comment());
        submission.setPhotoUrl(request.photoUrl());
        submission.setCreatedAt(Instant.now());
        return QuestSubmissionDto.from(submissionRepository.save(submission));
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
     * Общий опыт квеста учитывается в XpService по одобренным заявкам.
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
        return QuestSubmissionDto.from(submissionRepository.save(submission));
    }

    @Transactional
    public QuestSubmissionDto reject(Long parentId, Long submissionId) {
        QuestSubmission submission = getOwnedSubmission(parentId, submissionId);
        if (!"PENDING".equals(submission.getStatus())) {
            throw new BadRequestException("Заявка уже обработана");
        }
        submission.setStatus("REJECTED");
        submission.setResolvedAt(Instant.now());
        return QuestSubmissionDto.from(submissionRepository.save(submission));
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
