package com.familymarket.child;

import com.familymarket.achievement.AchievementService;
import com.familymarket.achievement.ChildAchievement;
import com.familymarket.achievement.ChildAchievementRepository;
import com.familymarket.balance.Balance;
import com.familymarket.balance.BalanceRepository;
import com.familymarket.common.BadRequestException;
import com.familymarket.common.NotFoundException;
import com.familymarket.dto.ChildProfileResponse;
import com.familymarket.dto.ChildSettingsDto;
import com.familymarket.dto.ChildSettingsUpdateRequest;
import com.familymarket.dto.ChildUpsertRequest;
import com.familymarket.dto.PurchasedItemDto;
import com.familymarket.purchase.Purchase;
import com.familymarket.purchase.PurchaseRepository;
import com.familymarket.purchase.PurchaseStatus;
import com.familymarket.user.User;
import com.familymarket.user.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.List;
import java.util.Set;

@Service
public class ChildService {

    private static final String KEY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Set<String> ALLOWED_THEMES = Set.of(
            "wow", "rainbow", "space", "ocean", "forest", "sunset", "minimal");
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final ChildRepository childRepository;
    private final UserRepository userRepository;
    private final BalanceRepository balanceRepository;
    private final ChildAchievementRepository childAchievementRepository;
    private final PurchaseRepository purchaseRepository;
    private final AchievementService achievementService;

    public ChildService(ChildRepository childRepository,
                        UserRepository userRepository,
                        BalanceRepository balanceRepository,
                        ChildAchievementRepository childAchievementRepository,
                        PurchaseRepository purchaseRepository,
                        AchievementService achievementService) {
        this.childRepository = childRepository;
        this.userRepository = userRepository;
        this.balanceRepository = balanceRepository;
        this.childAchievementRepository = childAchievementRepository;
        this.purchaseRepository = purchaseRepository;
        this.achievementService = achievementService;
    }

    public List<Child> list(Long parentId) {
        return childRepository.findByParentIdOrderByCreatedAtAsc(parentId);
    }

    @Transactional
    public Child create(Long parentId, ChildUpsertRequest request) {
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));
        Child child = new Child();
        child.setParent(parent);
        child.setName(request.name().trim());
        child.setAvatarEmoji(blankToDefault(request.avatarEmoji(), "😊"));
        child.setAccessKey(generateKey());
        child.setActive(true);
        child.setCreatedAt(Instant.now());
        return childRepository.save(child);
    }

    @Transactional
    public Child update(Long parentId, Long childId, ChildUpsertRequest request) {
        Child child = getOwned(parentId, childId);
        child.setName(request.name().trim());
        if (request.avatarEmoji() != null && !request.avatarEmoji().isBlank()) {
            child.setAvatarEmoji(request.avatarEmoji().trim());
        }
        if (request.active() != null) {
            child.setActive(request.active());
        }
        return childRepository.save(child);
    }

    @Transactional
    public Child regenerateKey(Long parentId, Long childId) {
        Child child = getOwned(parentId, childId);
        child.setAccessKey(generateKey());
        return childRepository.save(child);
    }

    @Transactional
    public void delete(Long parentId, Long childId) {
        childRepository.delete(getOwned(parentId, childId));
    }

    public Child session(String accessKey) {
        return childRepository.findByAccessKeyAndActiveTrue(accessKey.trim().toUpperCase())
                .orElseThrow(() -> new BadRequestException("Неверный ключ доступа"));
    }

    @Transactional
    public ChildProfileResponse profile(Long childId) {
        // Автоначисление достижений при просмотре профиля (лениво)
        achievementService.checkProgress(childId);

        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        List<Balance> balances = balanceRepository.findByChildIdOrderByStoreIdAsc(childId);
        List<ChildAchievement> unlocked = childAchievementRepository.findByChildIdOrderByUnlockedAtDesc(childId);
        List<Purchase> paid = purchaseRepository.findByChildIdAndStatus(childId, PurchaseStatus.PAID);
        BigDecimal paidTotal = paid.stream()
                .map(Purchase::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<PurchasedItemDto> purchasedItems = paid.stream()
                .map(p -> new PurchasedItemDto(
                        p.getProduct().getId(), p.getProduct().getName(), p.getAmount(),
                        p.getStore().getId(), p.getStore().getName(),
                        p.getStore().getCurrencyName(), p.getStore().getCurrencyIcon(),
                        p.getConfirmedAt()))
                .toList();

        return new ChildProfileResponse(
                new ChildProfileResponse.ChildBrief(child.getId(), child.getName(), child.getAvatarEmoji()),
                balances.stream()
                        .map(b -> new ChildProfileResponse.BalanceInfo(
                                b.getStore().getId(), b.getStore().getName(),
                                b.getStore().getCurrencyName(), b.getStore().getCurrencyIcon(), b.getAmount()))
                        .toList(),
                new ChildProfileResponse.Stats(paid.size(), paidTotal),
                unlocked.stream()
                        .map(ca -> new ChildProfileResponse.AchievementInfo(
                                ca.getAchievement().getId(), ca.getAchievement().getName(),
                                ca.getAchievement().getDescription(), ca.getAchievement().getIcon(),
                                ca.getUnlockedAt()))
                        .toList(),
                purchasedItems);
    }

    public Child getOwned(Long parentId, Long childId) {
        return childRepository.findByIdAndParentId(childId, parentId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
    }

    // ---------- Настройки интерфейса ребёнка ----------

    @Transactional(readOnly = true)
    public ChildSettingsDto settings(Long parentId, Long childId) {
        return ChildSettingsDto.from(getOwned(parentId, childId));
    }

    @Transactional
    public ChildSettingsDto updateSettings(Long parentId, Long childId, ChildSettingsUpdateRequest request) {
        return ChildSettingsDto.from(applySettings(getOwned(parentId, childId), request));
    }

    @Transactional(readOnly = true)
    public ChildSettingsDto mySettings(Long childId) {
        return ChildSettingsDto.from(childRepository.findById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден")));
    }

    @Transactional
    public ChildSettingsDto updateMySettings(Long childId, ChildSettingsUpdateRequest request) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        return ChildSettingsDto.from(applySettings(child, request));
    }

    private Child applySettings(Child child, ChildSettingsUpdateRequest request) {
        if (request.theme() != null && !request.theme().isBlank()) {
            String theme = request.theme().trim().toLowerCase();
            if (!ALLOWED_THEMES.contains(theme)) {
                throw new BadRequestException("Неизвестная тема: " + theme);
            }
            child.setTheme(theme);
        }
        if (request.homeWidgets() != null) {
            List<String> widgets = request.homeWidgets().stream()
                    .map(String::trim)
                    .filter(w -> !w.isBlank())
                    .distinct()
                    .toList();
            try {
                child.setHomeWidgets(MAPPER.writeValueAsString(widgets));
            } catch (Exception e) {
                throw new BadRequestException("Некорректный список виджетов");
            }
        }
        return childRepository.save(child);
    }

    private String generateKey() {
        StringBuilder sb = new StringBuilder();
        for (int group = 0; group < 3; group++) {
            for (int i = 0; i < 4; i++) {
                sb.append(KEY_ALPHABET.charAt(RANDOM.nextInt(KEY_ALPHABET.length())));
            }
            if (group < 2) {
                sb.append('-');
            }
        }
        return sb.toString();
    }

    private String blankToDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }
}