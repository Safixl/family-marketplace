package com.familymarket.achievement;

import com.familymarket.common.CurrentUser;
import com.familymarket.dto.AchievementDto;
import com.familymarket.dto.AchievementUpsertRequest;
import com.familymarket.dto.GrantAchievementRequest;
import com.familymarket.dto.GrantResult;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/parent/achievements")
public class AchievementController {

    private final AchievementService achievementService;

    public AchievementController(AchievementService achievementService) {
        this.achievementService = achievementService;
    }

    @GetMapping
    public List<AchievementDto> list() {
        return achievementService.list(CurrentUser.parentId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AchievementDto create(@Valid @RequestBody AchievementUpsertRequest request) {
        return AchievementDto.from(achievementService.create(CurrentUser.parentId(), request));
    }

    @PutMapping("/{id}")
    public AchievementDto update(@PathVariable Long id, @Valid @RequestBody AchievementUpsertRequest request) {
        return AchievementDto.from(achievementService.update(CurrentUser.parentId(), id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        achievementService.delete(CurrentUser.parentId(), id);
    }

    @PostMapping("/grant")
    public GrantResult grant(@Valid @RequestBody GrantAchievementRequest request) {
        return achievementService.grant(CurrentUser.parentId(), request);
    }
}