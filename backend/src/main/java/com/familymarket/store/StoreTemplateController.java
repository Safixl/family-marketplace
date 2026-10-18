package com.familymarket.store;

import com.familymarket.common.CurrentUser;
import com.familymarket.dto.SkillActivationDto;
import com.familymarket.dto.StoreDto;
import com.familymarket.dto.StoreTemplateDto;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class StoreTemplateController {

    private final StoreTemplateService storeTemplateService;

    public StoreTemplateController(StoreTemplateService storeTemplateService) {
        this.storeTemplateService = storeTemplateService;
    }

    @GetMapping("/api/parent/store-templates")
    public List<StoreTemplateDto> listTemplates() {
        return storeTemplateService.templates().stream().map(StoreTemplateService::toDto).toList();
    }

    /** Активировать навык ребёнку: ?childId= — шаблон включается конкретному ребёнку. */
    @PostMapping("/api/parent/store-templates/{slug}/activate")
    @ResponseStatus(HttpStatus.CREATED)
    public StoreDto activate(@PathVariable String slug, @RequestParam Long childId) {
        return StoreDto.from(storeTemplateService.activate(CurrentUser.parentId(), slug, childId));
    }

    /** Активированные навыки детей родителя (для вкладок навыков и обзора). */
    @GetMapping("/api/parent/skill-activations")
    public List<SkillActivationDto> activations() {
        return storeTemplateService.activations(CurrentUser.parentId());
    }
}