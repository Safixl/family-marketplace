package com.familymarket.balance;

import com.familymarket.child.Child;
import com.familymarket.child.ChildRepository;
import com.familymarket.common.BadRequestException;
import com.familymarket.common.NotFoundException;
import com.familymarket.dto.BalanceAdjustRequest;
import com.familymarket.dto.BalanceRowDto;
import com.familymarket.store.Store;
import com.familymarket.store.StoreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BalanceService {

    private final BalanceRepository balanceRepository;
    private final ChildRepository childRepository;
    private final StoreRepository storeRepository;

    public BalanceService(BalanceRepository balanceRepository,
                          ChildRepository childRepository,
                          StoreRepository storeRepository) {
        this.balanceRepository = balanceRepository;
        this.childRepository = childRepository;
        this.storeRepository = storeRepository;
    }

    /**
     * Матрица «ребенок × магазин» с текущими остатками (для родителя).
     */
    @Transactional(readOnly = true)
    public List<BalanceRowDto> listForParent(Long parentId) {
        List<Child> children = childRepository.findByParentIdOrderByCreatedAtAsc(parentId);
        List<Store> stores = storeRepository.findByParentIdOrderByCreatedAtAsc(parentId);
        List<Balance> balances = balanceRepository.findByChild_ParentId(parentId);

        Map<String, BigDecimal> byKey = new HashMap<>();
        for (Balance balance : balances) {
            byKey.put(key(balance.getChild().getId(), balance.getStore().getId()), balance.getAmount());
        }

        List<BalanceRowDto> rows = new ArrayList<>();
        for (Child child : children) {
            if (!child.isActive()) {
                continue;
            }
            for (Store store : stores) {
                if (!store.isActive()) {
                    continue;
                }
                rows.add(new BalanceRowDto(
                        child.getId(), child.getName(), child.getAvatarEmoji(),
                        store.getId(), store.getName(), store.getCurrencyName(), store.getCurrencyIcon(),
                        byKey.getOrDefault(key(child.getId(), store.getId()), BigDecimal.ZERO)));
            }
        }
        return rows;
    }

    /**
     * Начисление/списание валюты с блокировкой строки баланса.
     */
    @Transactional
    public BalanceRowDto adjust(Long parentId, BalanceAdjustRequest request) {
        Child child = childRepository.findByIdAndParentId(request.childId(), parentId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        Store store = storeRepository.findByIdAndParentId(request.storeId(), parentId)
                .orElseThrow(() -> new NotFoundException("Магазин не найден"));
        if (request.delta().signum() == 0) {
            throw new BadRequestException("Изменение должно быть ненулевым");
        }

        Balance balance = balanceRepository.findByChildIdAndStoreIdForUpdate(child.getId(), store.getId())
                .orElseGet(() -> {
                    Balance created = new Balance();
                    created.setChild(child);
                    created.setStore(store);
                    created.setAmount(BigDecimal.ZERO);
                    created.setUpdatedAt(Instant.now());
                    return created;
                });

        BigDecimal newAmount = balance.getAmount().add(request.delta());
        if (newAmount.signum() < 0) {
            throw new BadRequestException("Баланс не может стать отрицательным");
        }
        balance.setAmount(newAmount);
        balance.setUpdatedAt(Instant.now());
        balanceRepository.save(balance);

        return new BalanceRowDto(
                child.getId(), child.getName(), child.getAvatarEmoji(),
                store.getId(), store.getName(), store.getCurrencyName(), store.getCurrencyIcon(), newAmount);
    }

    /**
     * Начислить/списать баллы (используется шаблонными магазинами: чтение, математика, дом).
     * Допускает отрицательный баланс (например, штраф за бардак).
     */
    @Transactional
    public void credit(Long childId, Long storeId, BigDecimal delta) {
        if (delta.signum() == 0) {
            return;
        }
        Balance balance = balanceRepository.findByChildIdAndStoreIdForUpdate(childId, storeId)
                .orElseGet(() -> {
                    Child child = childRepository.findById(childId)
                            .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
                    Store store = storeRepository.findById(storeId)
                            .orElseThrow(() -> new NotFoundException("Магазин не найден"));
                    Balance created = new Balance();
                    created.setChild(child);
                    created.setStore(store);
                    created.setAmount(BigDecimal.ZERO);
                    created.setUpdatedAt(Instant.now());
                    return created;
                });
        balance.setAmount(balance.getAmount().add(delta));
        balance.setUpdatedAt(Instant.now());
        balanceRepository.save(balance);
    }

    private String key(Long childId, Long storeId) {
        return childId + ":" + storeId;
    }
}