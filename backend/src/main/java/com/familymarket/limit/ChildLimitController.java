package com.familymarket.limit;

import com.familymarket.common.CurrentUser;
import com.familymarket.dto.LimitStateDto;
import com.familymarket.dto.PocketRequestCreateRequest;
import com.familymarket.dto.PocketRequestDto;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/** Ребёнок: состояние лимитов, таймеры, запрос карманных денег. */
@RestController
public class ChildLimitController {

    private final LimitService limitService;

    public ChildLimitController(LimitService limitService) {
        this.limitService = limitService;
    }

    @GetMapping("/api/child/limits")
    public LimitStateDto state() {
        return limitService.getState(CurrentUser.childId());
    }

    @PostMapping("/api/child/limits/{type}/start")
    public void start(@PathVariable String type) {
        limitService.startTimer(CurrentUser.childId(), type);
    }

    @PostMapping("/api/child/limits/{type}/stop")
    public void stop(@PathVariable String type) {
        limitService.stopTimer(CurrentUser.childId(), type);
    }

    @PostMapping("/api/child/pocket/request")
    public PocketRequestDto requestPocket(@Valid @RequestBody PocketRequestCreateRequest request) {
        return limitService.requestPocket(CurrentUser.childId(), request);
    }
}