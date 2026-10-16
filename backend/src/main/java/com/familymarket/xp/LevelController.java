package com.familymarket.xp;

import com.familymarket.common.CurrentUser;
import com.familymarket.dto.LevelDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LevelController {

    private final XpService xpService;

    public LevelController(XpService xpService) {
        this.xpService = xpService;
    }

    /** Общий уровень и опыт персонажа ребёнка. */
    @GetMapping("/api/child/level")
    public LevelDto level() {
        return xpService.level(CurrentUser.childId());
    }
}
