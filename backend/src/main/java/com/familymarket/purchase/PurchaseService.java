package com.familymarket.purchase;

import com.familymarket.achievement.AchievementService;
import com.familymarket.balance.Balance;
import com.familymarket.balance.BalanceRepository;
import com.familymarket.common.BadRequestException;
import com.familymarket.common.NotFoundException;
import com.familymarket.dto.ChildPurchaseDto;
import com.familymarket.dto.CreatePurchaseRequest;
import com.familymarket.dto.PurchaseDto;
import com.familymarket.inventory.InventoryService;
import com.familymarket.limit.LimitService;
import com.familymarket.product.Product;
import com.familymarket.product.ProductRepository;
import com.familymarket.store.Store;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final ProductRepository productRepository;
    private final BalanceRepository balanceRepository;
    private final AchievementService achievementService;
    private final InventoryService inventoryService;
    private final LimitService limitService;

    public PurchaseService(PurchaseRepository purchaseRepository,
                           ProductRepository productRepository,
                           BalanceRepository balanceRepository,
                           AchievementService achievementService,
                           InventoryService inventoryService,
                           LimitService limitService) {
        this.purchaseRepository = purchaseRepository;
        this.productRepository = productRepository;
        this.balanceRepository = balanceRepository;
        this.achievementService = achievementService;
        this.inventoryService = inventoryService;
        this.limitService = limitService;
    }

    @Transactional(readOnly = true)
    public List<PurchaseDto> listForParent(Long parentId, PurchaseStatus status) {
        List<Purchase> purchases = status == null
                ? purchaseRepository.findByChild_ParentIdOrderByCreatedAtDesc(parentId)
                : purchaseRepository.findByChild_ParentIdAndStatusOrderByCreatedAtDesc(parentId, status);
        return purchases.stream().map(PurchaseDto::from).toList();
    }

    @Transactional(readOnly = true)
    public List<ChildPurchaseDto> listForChild(Long childId) {
        return purchaseRepository.findByChildIdOrderByCreatedAtDesc(childId)
                .stream().map(ChildPurchaseDto::from).toList();
    }

    /**
     * Мгновенная покупка без подтверждения родителя: транзакционное списание
     * баланса, статус PAID, товар в инвентарь, эффекты и ачивки применяются сразу.
     */
    @Transactional
    public ChildPurchaseDto create(Long childId, CreatePurchaseRequest request) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new NotFoundException("Товар не найден"));
        Store store = product.getStore();
        if (!store.isActive()) {
            throw new BadRequestException("Магазин неактивен");
        }
        if (!product.isActive()) {
            throw new BadRequestException("Товар неактивен");
        }

        Integer limit = product.getLimitPerChild();
        if (limit != null) {
            long used = purchaseRepository.countByProductIdAndChildIdAndStatusIn(
                    product.getId(), childId, List.of(PurchaseStatus.PAID));
            if (used >= limit) {
                throw new BadRequestException("Лимит покупок этого товара исчерпан");
            }
        }

        Balance balance = balanceRepository.findByChildIdAndStoreIdForUpdate(childId, store.getId())
                .orElseThrow(() -> new BadRequestException("Недостаточно средств"));
        if (balance.getAmount().compareTo(product.getPrice()) < 0) {
            throw new BadRequestException("Недостаточно средств");
        }
        balance.setAmount(balance.getAmount().subtract(product.getPrice()));
        balance.setUpdatedAt(Instant.now());

        Instant now = Instant.now();
        Purchase purchase = new Purchase();
        purchase.setChild(balance.getChild());
        purchase.setStore(store);
        purchase.setProduct(product);
        purchase.setAmount(product.getPrice());
        purchase.setStatus(PurchaseStatus.PAID);
        purchase.setCreatedAt(now);
        purchase.setConfirmedAt(now);
        purchaseRepository.save(purchase);

        // Одноразовая покупка: товар магазина «Дом» пропадает из магазина после покупки
        if ("HOME".equals(store.getTemplateType())) {
            product.setActive(false);
            productRepository.save(product);
        }

        // Купленный товар попадает в инвентарь ребёнка
        inventoryService.addFromPurchase(purchase);

        // Эффект товара: увеличение лимита (одноразовое на сегодня / постоянное)
        limitService.applyProductEffect(childId, product);

        // Автоначисление достижений
        achievementService.checkProgress(childId);
        return ChildPurchaseDto.from(purchase);
    }

    /**
     * Подтверждение: транзакционное повторное списание баланса, статус PAID.
     */
    @Transactional
    public PurchaseDto approve(Long parentId, Long purchaseId) {
        Purchase purchase = getOwned(parentId, purchaseId);
        if (purchase.getStatus() != PurchaseStatus.PENDING) {
            throw new BadRequestException("Заказ уже обработан");
        }
        Balance balance = balanceRepository
                .findByChildIdAndStoreIdForUpdate(purchase.getChild().getId(), purchase.getStore().getId())
                .orElseThrow(() -> new BadRequestException("У ребенка нет баланса в этом магазине"));
        if (balance.getAmount().compareTo(purchase.getAmount()) < 0) {
            throw new BadRequestException("Недостаточно средств у ребенка");
        }
        balance.setAmount(balance.getAmount().subtract(purchase.getAmount()));
        balance.setUpdatedAt(Instant.now());
        purchase.setStatus(PurchaseStatus.PAID);
        purchase.setConfirmedAt(Instant.now());
        purchaseRepository.save(purchase);

        // Одноразовая покупка: товар магазина «Дом» пропадает из магазина после одобрения
        if ("HOME".equals(purchase.getStore().getTemplateType())) {
            Product product = purchase.getProduct();
            product.setActive(false);
            productRepository.save(product);
        }

        // Купленный товар попадает в инвентарь ребёнка (доступен для активации)
        inventoryService.addFromPurchase(purchase);

        // Эффект товара: увеличение лимита (одноразовое на сегодня / постоянное)
        limitService.applyProductEffect(purchase.getChild().getId(), purchase.getProduct());

        // Автоначисление достижений (например, «выкупить N товаров в магазине Дом»)
        achievementService.checkProgress(purchase.getChild().getId());
        return PurchaseDto.from(purchase);
    }

    /**
     * Отклонение: статус REJECTED, списания не было.
     */
    @Transactional
    public PurchaseDto reject(Long parentId, Long purchaseId) {
        Purchase purchase = getOwned(parentId, purchaseId);
        if (purchase.getStatus() != PurchaseStatus.PENDING) {
            throw new BadRequestException("Заказ уже обработан");
        }
        purchase.setStatus(PurchaseStatus.REJECTED);
        purchase.setConfirmedAt(Instant.now());
        return PurchaseDto.from(purchase);
    }

    private Purchase getOwned(Long parentId, Long purchaseId) {
        return purchaseRepository.findByIdAndChild_ParentId(purchaseId, parentId)
                .orElseThrow(() -> new NotFoundException("Покупка не найдена"));
    }
}