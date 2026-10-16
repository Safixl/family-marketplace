package com.familymarket.store;

import com.familymarket.child.ChildRepository;
import com.familymarket.common.NotFoundException;
import com.familymarket.dto.StoreUpsertRequest;
import com.familymarket.user.User;
import com.familymarket.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class StoreService {

    private final StoreRepository storeRepository;
    private final UserRepository userRepository;
    private final ChildRepository childRepository;

    public StoreService(StoreRepository storeRepository,
                        UserRepository userRepository,
                        ChildRepository childRepository) {
        this.storeRepository = storeRepository;
        this.userRepository = userRepository;
        this.childRepository = childRepository;
    }

    public List<Store> list(Long parentId) {
        return storeRepository.findByParentIdOrderByCreatedAtAsc(parentId);
    }

    @Transactional(readOnly = true)
    public List<Store> listActiveForChild(Long childId) {
        Long parentId = childRepository.findParentIdById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        return storeRepository.findByParentIdAndActiveTrueOrderByCreatedAtAsc(parentId);
    }

    @Transactional
    public Store create(Long parentId, StoreUpsertRequest request) {
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));
        Store store = new Store();
        store.setParent(parent);
        store.setName(request.name().trim());
        store.setDescription(request.description());
        store.setCurrencyName(request.currencyName().trim());
        store.setCurrencyIcon(defaultIcon(request.currencyIcon()));
        store.setActive(request.active() == null || request.active());
        store.setWardrobe(Boolean.TRUE.equals(request.wardrobe()));
        store.setCreatedAt(Instant.now());
        return storeRepository.save(store);
    }

    @Transactional
    public Store update(Long parentId, Long storeId, StoreUpsertRequest request) {
        Store store = getOwned(parentId, storeId);
        store.setName(request.name().trim());
        store.setDescription(request.description());
        store.setCurrencyName(request.currencyName().trim());
        if (request.currencyIcon() != null && !request.currencyIcon().isBlank()) {
            store.setCurrencyIcon(request.currencyIcon().trim());
        }
        if (request.active() != null) {
            store.setActive(request.active());
        }
        if (request.wardrobe() != null) {
            store.setWardrobe(request.wardrobe());
        }
        return storeRepository.save(store);
    }

    @Transactional
    public void delete(Long parentId, Long storeId) {
        storeRepository.delete(getOwned(parentId, storeId));
    }

    public Store getOwned(Long parentId, Long storeId) {
        return storeRepository.findByIdAndParentId(storeId, parentId)
                .orElseThrow(() -> new NotFoundException("Магазин не найден"));
    }

    private String defaultIcon(String icon) {
        return icon == null || icon.isBlank() ? "🪙" : icon.trim();
    }
}