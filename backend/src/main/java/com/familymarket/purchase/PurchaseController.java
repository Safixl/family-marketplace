package com.familymarket.purchase;

import com.familymarket.common.CurrentUser;
import com.familymarket.dto.ChildPurchaseDto;
import com.familymarket.dto.CreatePurchaseRequest;
import com.familymarket.dto.PurchaseDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class PurchaseController {

    private final PurchaseService purchaseService;

    public PurchaseController(PurchaseService purchaseService) {
        this.purchaseService = purchaseService;
    }

    // ---------- Родитель ----------

    @GetMapping("/api/parent/purchases")
    public List<PurchaseDto> listPurchases(@RequestParam(required = false) PurchaseStatus status) {
        return purchaseService.listForParent(CurrentUser.parentId(), status);
    }

    @PostMapping("/api/parent/purchases/{id}/approve")
    public PurchaseDto approve(@PathVariable Long id) {
        return purchaseService.approve(CurrentUser.parentId(), id);
    }

    @PostMapping("/api/parent/purchases/{id}/reject")
    public PurchaseDto reject(@PathVariable Long id) {
        return purchaseService.reject(CurrentUser.parentId(), id);
    }

    // ---------- Ребенок ----------

    @GetMapping("/api/child/purchases")
    public List<ChildPurchaseDto> listChildPurchases() {
        return purchaseService.listForChild(CurrentUser.childId());
    }

    @PostMapping("/api/child/purchases")
    @ResponseStatus(HttpStatus.CREATED)
    public ChildPurchaseDto createPurchase(@Valid @RequestBody CreatePurchaseRequest request) {
        return purchaseService.create(CurrentUser.childId(), request);
    }
}