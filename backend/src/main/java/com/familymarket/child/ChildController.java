package com.familymarket.child;

import com.familymarket.achievement.AchievementService;
import com.familymarket.common.CurrentUser;
import com.familymarket.dto.ChildAchievementGroupDto;
import com.familymarket.dto.ChildDto;
import com.familymarket.dto.ChildProfileResponse;
import com.familymarket.dto.ChildSessionRequest;
import com.familymarket.dto.ChildSettingsDto;
import com.familymarket.dto.ChildSettingsUpdateRequest;
import com.familymarket.dto.ChildUpsertRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ChildController {

    private final ChildService childService;
    private final AchievementService achievementService;

    public ChildController(ChildService childService, AchievementService achievementService) {
        this.childService = childService;
        this.achievementService = achievementService;
    }

    // ---------- Управление детьми (родитель) ----------

    @GetMapping("/api/parent/children")
    public List<ChildDto> listChildren() {
        return childService.list(CurrentUser.parentId()).stream().map(ChildDto::from).toList();
    }

    @PostMapping("/api/parent/children")
    @ResponseStatus(HttpStatus.CREATED)
    public ChildDto createChild(@Valid @RequestBody ChildUpsertRequest request) {
        return ChildDto.from(childService.create(CurrentUser.parentId(), request));
    }

    @PutMapping("/api/parent/children/{id}")
    public ChildDto updateChild(@PathVariable Long id, @Valid @RequestBody ChildUpsertRequest request) {
        return ChildDto.from(childService.update(CurrentUser.parentId(), id, request));
    }

    @DeleteMapping("/api/parent/children/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteChild(@PathVariable Long id) {
        childService.delete(CurrentUser.parentId(), id);
    }

    @PostMapping("/api/parent/children/{id}/regenerate-key")
    public ChildDto regenerateKey(@PathVariable Long id) {
        return ChildDto.from(childService.regenerateKey(CurrentUser.parentId(), id));
    }

    @GetMapping("/api/parent/children/{id}/settings")
    public ChildSettingsDto childSettings(@PathVariable Long id) {
        return childService.settings(CurrentUser.parentId(), id);
    }

    @PutMapping("/api/parent/children/{id}/settings")
    public ChildSettingsDto updateChildSettings(@PathVariable Long id,
                                                @Valid @RequestBody ChildSettingsUpdateRequest request) {
        return childService.updateSettings(CurrentUser.parentId(), id, request);
    }

    // ---------- Сессия и профиль ребенка ----------

    @PostMapping("/api/child/session")
    public ChildDto childSession(@Valid @RequestBody ChildSessionRequest request) {
        return ChildDto.from(childService.session(request.accessKey()));
    }

    @GetMapping("/api/child/profile")
    public ChildProfileResponse childProfile() {
        return childService.profile(CurrentUser.childId());
    }

    @GetMapping("/api/child/achievements")
    public List<ChildAchievementGroupDto> childAchievements() {
        return achievementService.childAchievements(CurrentUser.childId());
    }

    @GetMapping("/api/child/settings")
    public ChildSettingsDto mySettings() {
        return childService.mySettings(CurrentUser.childId());
    }

    @PutMapping("/api/child/settings")
    public ChildSettingsDto updateMySettings(@Valid @RequestBody ChildSettingsUpdateRequest request) {
        return childService.updateMySettings(CurrentUser.childId(), request);
    }
}