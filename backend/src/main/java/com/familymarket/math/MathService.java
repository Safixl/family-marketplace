package com.familymarket.math;

import com.familymarket.achievement.AchievementService;
import com.familymarket.balance.BalanceService;
import com.familymarket.child.Child;
import com.familymarket.child.ChildRepository;
import com.familymarket.common.NotFoundException;
import com.familymarket.dto.MathAttemptDto;
import com.familymarket.dto.MathSolveRequest;
import com.familymarket.dto.MathSolveResult;
import com.familymarket.dto.MathStatsDto;
import com.familymarket.dto.MathTaskDto;
import com.familymarket.dto.MathTaskUpsertRequest;
import com.familymarket.store.Store;
import com.familymarket.store.StoreService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
public class MathService {

    private final MathTaskRepository taskRepository;
    private final MathAttemptRepository attemptRepository;
    private final ChildRepository childRepository;
    private final StoreService storeService;
    private final BalanceService balanceService;
    private final AchievementService achievementService;

    public MathService(MathTaskRepository taskRepository,
                       MathAttemptRepository attemptRepository,
                       ChildRepository childRepository,
                       StoreService storeService,
                       BalanceService balanceService,
                       AchievementService achievementService) {
        this.taskRepository = taskRepository;
        this.attemptRepository = attemptRepository;
        this.childRepository = childRepository;
        this.storeService = storeService;
        this.balanceService = balanceService;
        this.achievementService = achievementService;
    }

    // ---------- Задачи (родитель, личные для ребёнка) ----------

    @Transactional(readOnly = true)
    public List<MathTaskDto> listTasks(Long parentId, Long childId) {
        childRepository.findByIdAndParentId(childId, parentId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        return taskRepository.findByChildIdOrderByCreatedAtAsc(childId)
                .stream().map(MathTaskDto::from).toList();
    }

    @Transactional
    public MathTaskDto createTask(Long parentId, Long storeId, Long childId, MathTaskUpsertRequest request) {
        Store store = storeService.getOwned(parentId, storeId);
        Child child = childRepository.findByIdAndParentId(childId, parentId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        MathTask task = new MathTask();
        task.setStore(store);
        task.setChild(child);
        task.setTitle(request.title().trim());
        task.setDescription(request.description());
        task.setAnswer(request.answer().trim());
        task.setPoints(request.points() == null ? BigDecimal.ZERO : request.points());
        task.setActive(request.active() == null || request.active());
        task.setCreatedAt(Instant.now());
        return MathTaskDto.from(taskRepository.save(task));
    }

    @Transactional
    public MathTaskDto updateTask(Long parentId, Long taskId, MathTaskUpsertRequest request) {
        MathTask task = getOwnedTask(parentId, taskId);
        task.setTitle(request.title().trim());
        task.setDescription(request.description());
        task.setAnswer(request.answer().trim());
        if (request.points() != null) {
            task.setPoints(request.points());
        }
        if (request.active() != null) {
            task.setActive(request.active());
        }
        return MathTaskDto.from(taskRepository.save(task));
    }

    @Transactional
    public void deleteTask(Long parentId, Long taskId) {
        taskRepository.delete(getOwnedTask(parentId, taskId));
    }

    // ---------- Решение (ребенок) ----------

    /**
     * Только личные задачи ребёнка, у которых ещё нет попыток.
     * После попытки (верной или нет) задача исчезает из списка.
     */
    @Transactional(readOnly = true)
    public List<MathTaskDto> childTasks(Long childId) {
        return taskRepository.findAvailableForChild(childId)
                .stream().map(MathTaskDto::from).toList();
    }

    @Transactional
    public MathSolveResult solve(Long childId, Long taskId, MathSolveRequest request) {
        MathTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new NotFoundException("Задача не найдена"));
        if (!task.isActive() || task.getChild() == null || !task.getChild().getId().equals(childId)) {
            throw new NotFoundException("Задача не найдена");
        }
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));

        boolean correct = task.getAnswer().trim().equalsIgnoreCase(request.answer().trim());
        BigDecimal points = correct ? task.getPoints() : BigDecimal.ZERO;

        MathAttempt attempt = new MathAttempt();
        attempt.setTask(task);
        attempt.setChild(child);
        attempt.setAnswer(request.answer().trim());
        attempt.setCorrect(correct);
        attempt.setPoints(points);
        attempt.setAttemptedAt(Instant.now());
        attemptRepository.save(attempt);

        if (correct && points.signum() > 0) {
            balanceService.credit(childId, task.getStore().getId(), points);
            achievementService.checkProgress(childId);
        }
        return new MathSolveResult(correct, points, task.getAnswer());
    }

    // ---------- Статистика ----------

    @Transactional(readOnly = true)
    public MathStatsDto statsForChild(Long parentId, Long childId) {
        childRepository.findByIdAndParentId(childId, parentId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        return buildStats(childId);
    }

    @Transactional(readOnly = true)
    public MathStatsDto childStats(Long childId) {
        return buildStats(childId);
    }

    private MathStatsDto buildStats(Long childId) {
        List<MathAttemptDto> attempts = attemptRepository.findByChildIdOrderByAttemptedAtDesc(childId)
                .stream().map(MathAttemptDto::from).toList();
        return new MathStatsDto(
                attemptRepository.countByChildId(childId),
                attemptRepository.countByChildId(childId),
                attemptRepository.countCorrectByChildId(childId),
                attemptRepository.sumPointsByChildId(childId),
                attempts);
    }

    private MathTask getOwnedTask(Long parentId, Long taskId) {
        return taskRepository.findByIdAndStore_ParentId(taskId, parentId)
                .orElseThrow(() -> new NotFoundException("Задача не найдена"));
    }
}