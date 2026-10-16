package com.familymarket.deposit;

import com.familymarket.common.CurrentUser;
import com.familymarket.dto.DepositDto;
import com.familymarket.dto.DepositRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class DepositController {

    private final DepositService depositService;

    public DepositController(DepositService depositService) {
        this.depositService = depositService;
    }

    @GetMapping("/api/child/deposits")
    public List<DepositDto> list() {
        return depositService.listForChild(CurrentUser.childId());
    }

    @PostMapping("/api/child/deposits/deposit")
    public DepositDto deposit(@RequestBody DepositRequest request) {
        return depositService.deposit(CurrentUser.childId(), request);
    }

    @PostMapping("/api/child/deposits/withdraw")
    public DepositDto withdraw(@RequestBody DepositRequest request) {
        return depositService.withdraw(CurrentUser.childId(), request);
    }
}
