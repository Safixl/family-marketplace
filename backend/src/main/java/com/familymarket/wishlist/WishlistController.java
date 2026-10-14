package com.familymarket.wishlist;

import com.familymarket.common.CurrentUser;
import com.familymarket.dto.WishlistCreateRequest;
import com.familymarket.dto.WishlistItemDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    // ---------- Ребенок ----------

    @GetMapping("/api/child/wishlist")
    public List<WishlistItemDto> childWishlist() {
        return wishlistService.listForChild(CurrentUser.childId());
    }

    @PostMapping("/api/child/wishlist")
    @ResponseStatus(HttpStatus.CREATED)
    public WishlistItemDto create(@Valid @RequestBody WishlistCreateRequest request) {
        return wishlistService.create(CurrentUser.childId(), request);
    }

    @DeleteMapping("/api/child/wishlist/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        wishlistService.deleteOwn(CurrentUser.childId(), id);
    }

    // ---------- Родитель ----------

    @GetMapping("/api/parent/children/{childId}/wishlist")
    public List<WishlistItemDto> childWishlist(@PathVariable Long childId) {
        return wishlistService.listForParent(CurrentUser.parentId(), childId);
    }

    @PostMapping("/api/parent/wishlist/{id}/done")
    public WishlistItemDto markDone(@PathVariable Long id) {
        return wishlistService.markDone(CurrentUser.parentId(), id);
    }

    @DeleteMapping("/api/parent/wishlist/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteForParent(@PathVariable Long id) {
        wishlistService.deleteForParent(CurrentUser.parentId(), id);
    }
}