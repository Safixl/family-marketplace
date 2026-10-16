package com.familymarket.seasonal;

import com.familymarket.common.CurrentUser;
import com.familymarket.dto.SeasonalEventDto;
import com.familymarket.dto.SeasonalEventUpsertRequest;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class SeasonalController {

    private final SeasonalService seasonalService;

    public SeasonalController(SeasonalService seasonalService) {
        this.seasonalService = seasonalService;
    }

    // ---------- Родитель ----------

    @GetMapping("/api/parent/seasonal-events")
    public List<SeasonalEventDto> listParent() {
        return seasonalService.listForParent(CurrentUser.parentId());
    }

    @PostMapping("/api/parent/seasonal-events")
    public SeasonalEventDto create(@RequestBody SeasonalEventUpsertRequest request) {
        return seasonalService.create(CurrentUser.parentId(), request);
    }

    @PutMapping("/api/parent/seasonal-events/{id}")
    public SeasonalEventDto update(@PathVariable Long id, @RequestBody SeasonalEventUpsertRequest request) {
        return seasonalService.update(CurrentUser.parentId(), id, request);
    }

    @DeleteMapping("/api/parent/seasonal-events/{id}")
    public void delete(@PathVariable Long id) {
        seasonalService.delete(CurrentUser.parentId(), id);
    }

    // ---------- Ребёнок: открытые ивенты ----------

    @GetMapping("/api/child/seasonal-events")
    public List<SeasonalEventDto> listOpen() {
        return seasonalService.listOpenForChild(CurrentUser.childId());
    }
}
