package com.familymarket.house;

import com.familymarket.common.CurrentUser;
import com.familymarket.dto.HouseDayDto;
import com.familymarket.dto.HouseDayUpsertRequest;
import com.familymarket.dto.HouseMonthResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.YearMonth;

@RestController
public class HouseController {

    private final HouseService houseService;

    public HouseController(HouseService houseService) {
        this.houseService = houseService;
    }

    // ---------- Родитель ----------

    @GetMapping("/api/parent/stores/{storeId}/house")
    public HouseMonthResponse getMonth(@PathVariable Long storeId,
                                       @RequestParam Long childId,
                                       @RequestParam(defaultValue = "#{T(java.time.YearMonth).now()}") String month) {
        return houseService.getMonth(CurrentUser.parentId(), storeId, childId, parseMonth(month));
    }

    @PutMapping("/api/parent/stores/{storeId}/house-days")
    public HouseDayDto upsertDay(@PathVariable Long storeId,
                                 @Valid @RequestBody HouseDayUpsertRequest request) {
        return houseService.upsertDay(CurrentUser.parentId(), storeId, request);
    }

    // ---------- Ребенок ----------

    @GetMapping("/api/child/stores/{storeId}/house")
    public HouseMonthResponse childMonth(@PathVariable Long storeId,
                                         @RequestParam(defaultValue = "#{T(java.time.YearMonth).now()}") String month) {
        return houseService.childMonth(CurrentUser.childId(), storeId, parseMonth(month));
    }

    private YearMonth parseMonth(String month) {
        try {
            return YearMonth.parse(month);
        } catch (Exception e) {
            return YearMonth.now();
        }
    }
}