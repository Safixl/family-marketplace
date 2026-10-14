package com.familymarket.store;

import com.familymarket.common.CurrentUser;
import com.familymarket.dto.StoreDto;
import com.familymarket.dto.StoreUpsertRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class StoreController {

    private final StoreService storeService;

    public StoreController(StoreService storeService) {
        this.storeService = storeService;
    }

    // ---------- Магазины (родитель) ----------

    @GetMapping("/api/parent/stores")
    public List<StoreDto> listStores() {
        return storeService.list(CurrentUser.parentId()).stream().map(StoreDto::from).toList();
    }

    @PostMapping("/api/parent/stores")
    @ResponseStatus(HttpStatus.CREATED)
    public StoreDto createStore(@Valid @RequestBody StoreUpsertRequest request) {
        return StoreDto.from(storeService.create(CurrentUser.parentId(), request));
    }

    @PutMapping("/api/parent/stores/{id}")
    public StoreDto updateStore(@PathVariable Long id, @Valid @RequestBody StoreUpsertRequest request) {
        return StoreDto.from(storeService.update(CurrentUser.parentId(), id, request));
    }

    @DeleteMapping("/api/parent/stores/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteStore(@PathVariable Long id) {
        storeService.delete(CurrentUser.parentId(), id);
    }

    // ---------- Витрина (ребенок) ----------

    @GetMapping("/api/child/stores")
    public List<StoreDto> childStores() {
        return storeService.listActiveForChild(CurrentUser.childId()).stream().map(StoreDto::from).toList();
    }
}