package com.familymarket.skill;

import com.familymarket.common.CurrentUser;
import com.familymarket.dto.SkillProgressDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class SkillController {

    private final SkillService skillService;

    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    @GetMapping("/api/child/skills")
    public List<SkillProgressDto> childSkills() {
        return skillService.progress(CurrentUser.childId());
    }
}
