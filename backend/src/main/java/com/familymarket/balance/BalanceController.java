package com.familymarket.balance;

import com.familymarket.common.CurrentUser;
import com.familymarket.dto.BalanceAdjustRequest;
import com.familymarket.dto.BalanceRowDto;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class BalanceController {

    private final BalanceService balanceService;

    public BalanceController(BalanceService balanceService) {
        this.balanceService = balanceService;
    }

    @GetMapping("/api/parent/balances")
    public List<BalanceRowDto> balances() {
        return balanceService.listForParent(CurrentUser.parentId());
    }

    @PostMapping("/api/parent/balances/adjust")
    public BalanceRowDto adjust(@Valid @RequestBody BalanceAdjustRequest request) {
        return balanceService.adjust(CurrentUser.parentId(), request);
    }
}