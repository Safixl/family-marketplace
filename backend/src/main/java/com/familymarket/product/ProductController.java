package com.familymarket.product;

import com.familymarket.child.ChildRepository;
import com.familymarket.common.BadRequestException;
import com.familymarket.common.CurrentUser;
import com.familymarket.common.NotFoundException;
import com.familymarket.dto.ChildProductDto;
import com.familymarket.dto.ProductDto;
import com.familymarket.dto.ProductUpsertRequest;
import com.familymarket.purchase.PurchaseRepository;
import com.familymarket.purchase.PurchaseStatus;
import com.familymarket.store.Store;
import com.familymarket.store.StoreRepository;
import com.familymarket.store.StoreService;
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

import java.time.Instant;
import java.util.List;

@RestController
public class ProductController {

    private final ProductRepository productRepository;
    private final StoreService storeService;
    private final StoreRepository storeRepository;
    private final ChildRepository childRepository;
    private final PurchaseRepository purchaseRepository;

    public ProductController(ProductRepository productRepository,
                             StoreService storeService,
                             StoreRepository storeRepository,
                             ChildRepository childRepository,
                             PurchaseRepository purchaseRepository) {
        this.productRepository = productRepository;
        this.storeService = storeService;
        this.storeRepository = storeRepository;
        this.childRepository = childRepository;
        this.purchaseRepository = purchaseRepository;
    }

    // ---------- Товары (родитель) ----------

    @GetMapping("/api/parent/stores/{storeId}/products")
    public List<ProductDto> listProducts(@PathVariable Long storeId) {
        storeService.getOwned(CurrentUser.parentId(), storeId);
        return productRepository.findByStoreIdOrderByCreatedAtAsc(storeId).stream().map(ProductDto::from).toList();
    }

    @PostMapping("/api/parent/stores/{storeId}/products")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductDto createProduct(@PathVariable Long storeId, @Valid @RequestBody ProductUpsertRequest request) {
        Store store = storeService.getOwned(CurrentUser.parentId(), storeId);
        Product product = new Product();
        product.setStore(store);
        product.setActive(request.active() == null || request.active());
        product.setCreatedAt(Instant.now());
        apply(product, request);
        return ProductDto.from(productRepository.save(product));
    }

    @PutMapping("/api/parent/products/{id}")
    public ProductDto updateProduct(@PathVariable Long id, @Valid @RequestBody ProductUpsertRequest request) {
        Product product = getOwned(id);
        apply(product, request);
        return ProductDto.from(productRepository.save(product));
    }

    @DeleteMapping("/api/parent/products/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable Long id) {
        productRepository.delete(getOwned(id));
    }

    // ---------- Витрина (ребенок) ----------

    @GetMapping("/api/child/stores/{storeId}/products")
    public List<ChildProductDto> childProducts(@PathVariable Long storeId) {
        Long childId = CurrentUser.childId();
        Long parentId = childRepository.findParentIdById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        Long storeParentId = storeRepository.findParentIdById(storeId)
                .orElseThrow(() -> new NotFoundException("Магазин не найден"));
        if (!storeParentId.equals(parentId)) {
            throw new BadRequestException("Магазин не найден");
        }
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new NotFoundException("Магазин не найден"));
        if (!store.isActive()) {
            throw new BadRequestException("Магазин неактивен");
        }

        return productRepository.findByStoreIdAndActiveTrueOrderByCreatedAtAsc(storeId).stream()
                .map(p -> new ChildProductDto(
                        p.getId(),
                        storeId,
                        store.getName(),
                        p.getName(),
                        p.getDescription(),
                        p.getPrice(),
                        p.getLimitPerChild(),
                        store.getCurrencyName(),
                        store.getCurrencyIcon(),
                        purchaseRepository.countByProductIdAndChildIdAndStatusIn(
                                p.getId(), childId, List.of(PurchaseStatus.PENDING, PurchaseStatus.PAID)),
                        purchaseRepository.existsByProductIdAndChildIdAndStatus(
                                p.getId(), childId, PurchaseStatus.PENDING)))
                .toList();
    }

    private Product getOwned(Long productId) {
        return productRepository.findByIdAndStore_ParentId(productId, CurrentUser.parentId())
                .orElseThrow(() -> new NotFoundException("Товар не найден"));
    }

    private void apply(Product product, ProductUpsertRequest request) {
        product.setName(request.name().trim());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setLimitPerChild(request.limitPerChild());
        if (request.active() != null) {
            product.setActive(request.active());
        }
    }
}