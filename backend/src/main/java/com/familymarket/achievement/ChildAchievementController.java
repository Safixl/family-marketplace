package com.familymarket.achievement;

import com.familymarket.common.CurrentUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Ребёнок: отслеживаемые достижения (показываются на главной). */
@RestController
public class ChildAchievementController {

    private final AchievementService achievementService;

    public ChildAchievementController(AchievementService achievementService) {
        this.achievementService = achievementService;
    }

    @GetMapping("/api/child/achievements/tracked")
    public List<Long> trackedIds() {
        return achievementService.trackedIds(CurrentUser.childId());
    }

    @PostMapping("/api/child/achievements/{id}/track")
    public boolean track(@PathVariable Long id) {
        return achievementService.track(CurrentUser.childId(), id);
    }
}