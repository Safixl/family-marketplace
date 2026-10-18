package com.familymarket.limit;

import com.familymarket.common.CurrentUser;
import com.familymarket.dto.ChildLimitsDto;
import com.familymarket.dto.ChildLimitsUpdateRequest;
import com.familymarket.dto.PocketRequestDto;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Родитель: настройка лимитов ребёнка и подтверждение выдачи карманных денег. */
@RestController
public class LimitController {

    private final LimitService limitService;

    public LimitController(LimitService limitService) {
        this.limitService = limitService;
    }

    @GetMapping("/api/parent/children/{childId}/limits")
    public ChildLimitsDto getLimits(@PathVariable Long childId) {
        return limitService.getChildLimits(CurrentUser.parentId(), childId);
    }

    @PutMapping("/api/parent/children/{childId}/limits")
    public ChildLimitsDto updateLimits(@PathVariable Long childId,
                                       @Valid @RequestBody ChildLimitsUpdateRequest request) {
        return limitService.updateChildLimits(CurrentUser.parentId(), childId, request);
    }

    @GetMapping("/api/parent/pocket-requests")
    public List<PocketRequestDto> pocketRequests() {
        return limitService.listPocketRequests(CurrentUser.parentId());
    }

    @PostMapping("/api/parent/pocket-requests/{id}/approve")
    public PocketRequestDto approvePocket(@PathVariable Long id) {
        return limitService.approvePocket(CurrentUser.parentId(), id);
    }

    @PostMapping("/api/parent/pocket-requests/{id}/reject")
    public PocketRequestDto rejectPocket(@PathVariable Long id) {
        return limitService.rejectPocket(CurrentUser.parentId(), id);
    }
}