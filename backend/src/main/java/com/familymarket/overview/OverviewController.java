package com.familymarket.overview;

import com.familymarket.common.CurrentUser;
import com.familymarket.dto.OverviewChildDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Родитель: сводка по всем детям (уровень, баллы, лимиты, квесты, дейлики, навыки). */
@RestController
public class OverviewController {

    private final OverviewService overviewService;

    public OverviewController(OverviewService overviewService) {
        this.overviewService = overviewService;
    }

    @GetMapping("/api/parent/overview")
    public List<OverviewChildDto> overview() {
        return overviewService.overview(CurrentUser.parentId());
    }
}