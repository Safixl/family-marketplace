package com.familymarket.common;

import com.familymarket.achievement.Achievement;
import com.familymarket.achievement.AchievementRepository;
import com.familymarket.achievement.ChildAchievement;
import com.familymarket.achievement.ChildAchievementRepository;
import com.familymarket.child.Child;
import com.familymarket.child.ChildRepository;
import com.familymarket.common.CurrentUser;
import com.familymarket.purchase.Purchase;
import com.familymarket.purchase.PurchaseRepository;
import com.familymarket.user.User;
import com.familymarket.user.UserRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

/**
 * Экспорт отчёта родителя в CSV: дети, достижения, покупки.
 * Файл открывается в Excel/Numbers, кодировка UTF-8 с BOM.
 */
@RestController
@RequestMapping("/api/parent/export")
public class ExportController {

    private final UserRepository userRepository;
    private final ChildRepository childRepository;
    private final AchievementRepository achievementRepository;
    private final ChildAchievementRepository childAchievementRepository;
    private final PurchaseRepository purchaseRepository;

    public ExportController(UserRepository userRepository,
                            ChildRepository childRepository,
                            AchievementRepository achievementRepository,
                            ChildAchievementRepository childAchievementRepository,
                            PurchaseRepository purchaseRepository) {
        this.userRepository = userRepository;
        this.childRepository = childRepository;
        this.achievementRepository = achievementRepository;
        this.childAchievementRepository = childAchievementRepository;
        this.purchaseRepository = purchaseRepository;
    }

    @GetMapping(value = "/report.csv", produces = "text/csv;charset=UTF-8")
    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> reportCsv() {
        Long parentId = CurrentUser.parentId();
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new com.familymarket.common.NotFoundException("Пользователь не найден"));

        StringBuilder csv = new StringBuilder();
        csv.append("\uFEFF"); // BOM для Excel

        // ---- Дети ----
        csv.append("ДЕТИ\n");
        csv.append("id;имя;возраст;активен\n");
        List<Child> children = childRepository.findByParentIdOrderByCreatedAtAsc(parentId);
        for (Child c : children) {
            csv.append(c.getId()).append(';')
                    .append(escape(c.getName())).append(';')
                    .append(c.getAge() != null ? c.getAge() : "").append(';')
                    .append(c.isActive() ? "да" : "нет").append('\n');
        }

        // ---- Достижения ----
        csv.append("\nДОСТИЖЕНИЯ\n");
        csv.append("id;иконка;название;навык;уровень;XP\n");
        List<Achievement> achievements = achievementRepository.findByParentIdOrderByCreatedAtAsc(parentId);
        for (Achievement a : achievements) {
            csv.append(a.getId()).append(';')
                    .append(escape(a.getIcon())).append(';')
                    .append(escape(a.getName())).append(';')
                    .append(a.getSkill() != null ? a.getSkill() : "").append(';')
                    .append(a.getLevel()).append(';')
                    .append(a.getXpReward()).append('\n');
        }

        // ---- Заработанные достижения детей ----
        csv.append("\nЗАРАБОТАННЫЕ ДОСТИЖЕНИЯ\n");
        csv.append("ребёнок;достижение;дата\n");
        for (Child c : children) {
            for (ChildAchievement ca : childAchievementRepository.findByChildIdOrderByUnlockedAtDesc(c.getId())) {
                csv.append(escape(c.getName())).append(';')
                        .append(escape(ca.getAchievement().getName())).append(';')
                        .append(ca.getUnlockedAt() != null
                                ? ca.getUnlockedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDate()
                                : "").append('\n');
            }
        }

        // ---- Покупки ----
        csv.append("\nПОКУПКИ\n");
        csv.append("ребёнок;товар;магазин;сумма;статус;дата\n");
        List<Purchase> purchases = purchaseRepository.findByChild_ParentIdOrderByCreatedAtDesc(parentId);
        for (Purchase p : purchases) {
            csv.append(escape(p.getChild().getName())).append(';')
                    .append(escape(p.getProduct().getName())).append(';')
                    .append(escape(p.getStore().getName())).append(';')
                    .append(p.getAmount()).append(';')
                    .append(p.getStatus()).append(';')
                    .append(p.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDate()).append('\n');
        }

        csv.append("\nОтчёт сформирован: ").append(LocalDate.now())
                .append(" · ").append(escape(parent.getName())).append('\n');

        byte[] body = csv.toString().getBytes(StandardCharsets.UTF_8);
        String filename = "family-report-" + LocalDate.now() + ".csv";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv;charset=UTF-8"))
                .body(body);
    }

    private static String escape(String value) {
        if (value == null) {
            return "";
        }
        if (value.contains(";") || value.contains("\n") || value.contains("\"")) {
            return '"' + value.replace("\"", "\"\"") + '"';
        }
        return value;
    }
}
