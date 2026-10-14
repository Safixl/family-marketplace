package com.familymarket.inventory;

import com.familymarket.common.BadRequestException;
import com.familymarket.common.NotFoundException;
import com.familymarket.dto.InventoryItemDto;
import com.familymarket.purchase.Purchase;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class InventoryService {

    private final InventoryItemRepository inventoryItemRepository;

    public InventoryService(InventoryItemRepository inventoryItemRepository) {
        this.inventoryItemRepository = inventoryItemRepository;
    }

    /**
     * Создание записи инвентаря после подтверждения покупки родителем.
     */
    @Transactional
    public void addFromPurchase(Purchase purchase) {
        if (inventoryItemRepository.existsByPurchaseId(purchase.getId())) {
            return;
        }
        InventoryItem item = new InventoryItem();
        item.setChild(purchase.getChild());
        item.setStore(purchase.getStore());
        item.setProduct(purchase.getProduct());
        item.setPurchase(purchase);
        item.setStatus("AVAILABLE");
        item.setCreatedAt(Instant.now());
        inventoryItemRepository.save(item);
    }

    // ---------- Ребенок ----------

    @Transactional(readOnly = true)
    public List<InventoryItemDto> listForChild(Long childId) {
        return inventoryItemRepository.findByChildIdOrderByCreatedAtDesc(childId)
                .stream().map(InventoryItemDto::from).toList();
    }

    /**
     * Запрос на активацию товара: AVAILABLE -> ACTIVATION_PENDING.
     */
    @Transactional
    public InventoryItemDto requestActivation(Long childId, Long itemId) {
        InventoryItem item = inventoryItemRepository.findByIdAndChildId(itemId, childId)
                .orElseThrow(() -> new NotFoundException("Товар не найден"));
        if (!"AVAILABLE".equals(item.getStatus())) {
            throw new BadRequestException("Товар уже обработан");
        }
        item.setStatus("ACTIVATION_PENDING");
        return InventoryItemDto.from(inventoryItemRepository.save(item));
    }

    // ---------- Родитель ----------

    @Transactional(readOnly = true)
    public List<InventoryItemDto> listPendingForParent(Long parentId) {
        return inventoryItemRepository.findByChild_ParentIdAndStatusOrderByCreatedAtDesc(parentId, "ACTIVATION_PENDING")
                .stream().map(InventoryItemDto::from).toList();
    }

    /**
     * Подтверждение активации: товар считается использованным и удаляется из доступных.
     */
    @Transactional
    public InventoryItemDto approve(Long parentId, Long itemId) {
        InventoryItem item = getOwned(parentId, itemId);
        if (!"ACTIVATION_PENDING".equals(item.getStatus())) {
            throw new BadRequestException("Нет запроса на активацию");
        }
        item.setStatus("ACTIVATED");
        item.setResolvedAt(Instant.now());
        return InventoryItemDto.from(inventoryItemRepository.save(item));
    }

    /**
     * Отказ в активации: товар возвращается в доступные.
     */
    @Transactional
    public InventoryItemDto reject(Long parentId, Long itemId) {
        InventoryItem item = getOwned(parentId, itemId);
        if (!"ACTIVATION_PENDING".equals(item.getStatus())) {
            throw new BadRequestException("Нет запроса на активацию");
        }
        item.setStatus("AVAILABLE");
        item.setResolvedAt(null);
        return InventoryItemDto.from(inventoryItemRepository.save(item));
    }

    private InventoryItem getOwned(Long parentId, Long itemId) {
        return inventoryItemRepository.findByIdAndChild_ParentId(itemId, parentId)
                .orElseThrow(() -> new NotFoundException("Товар не найден"));
    }
}
