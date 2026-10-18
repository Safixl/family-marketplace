package com.familymarket.inventory;

import com.familymarket.common.CurrentUser;
import com.familymarket.dto.InventoryItemDto;
import com.familymarket.dto.InventoryStackDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    // ---------- Ребенок ----------

    /** Инвентарь-стопки (без статусов): неиспользованные покупки всех магазинов. */
    @GetMapping("/api/child/inventory")
    public List<InventoryStackDto> childInventory() {
        return inventoryService.listStacksForChild(CurrentUser.childId());
    }

    /** Использовать предмет: одна штука товара исчезает из инвентаря. */
    @PostMapping("/api/child/inventory/{productId}/use")
    public void useItem(@PathVariable Long productId) {
        inventoryService.useItem(CurrentUser.childId(), productId);
    }

    // ---------- Ребенок (легаси-флоу активации, обратная совместимость) ----------

    @PostMapping("/api/child/inventory/{id}/activate")
    public InventoryItemDto requestActivation(@PathVariable Long id) {
        return inventoryService.requestActivation(CurrentUser.childId(), id);
    }

    // ---------- Родитель ----------

    @GetMapping("/api/parent/inventory/pending")
    public List<InventoryItemDto> pendingActivations() {
        return inventoryService.listPendingForParent(CurrentUser.parentId());
    }

    @PostMapping("/api/parent/inventory/{id}/approve")
    public InventoryItemDto approve(@PathVariable Long id) {
        return inventoryService.approve(CurrentUser.parentId(), id);
    }

    @PostMapping("/api/parent/inventory/{id}/reject")
    public InventoryItemDto reject(@PathVariable Long id) {
        return inventoryService.reject(CurrentUser.parentId(), id);
    }
}
