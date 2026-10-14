package com.familymarket.wishlist;

import com.familymarket.child.Child;
import com.familymarket.child.ChildRepository;
import com.familymarket.common.NotFoundException;
import com.familymarket.dto.WishlistCreateRequest;
import com.familymarket.dto.WishlistItemDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final ChildRepository childRepository;

    public WishlistService(WishlistItemRepository wishlistItemRepository,
                           ChildRepository childRepository) {
        this.wishlistItemRepository = wishlistItemRepository;
        this.childRepository = childRepository;
    }

    @Transactional(readOnly = true)
    public List<WishlistItemDto> listForChild(Long childId) {
        return wishlistItemRepository.findByChildIdOrderByCreatedAtDesc(childId)
                .stream().map(WishlistItemDto::from).toList();
    }

    @Transactional(readOnly = true)
    public List<WishlistItemDto> listForParent(Long parentId, Long childId) {
        childRepository.findByIdAndParentId(childId, parentId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        return listForChild(childId);
    }

    @Transactional
    public WishlistItemDto create(Long childId, WishlistCreateRequest request) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        WishlistItem item = new WishlistItem();
        item.setChild(child);
        item.setTitle(request.title().trim());
        item.setLink(trimToNull(request.link()));
        item.setPrice(request.price());
        item.setDesire(request.desire() == null ? 3 : Math.max(1, Math.min(5, request.desire())));
        item.setStatus("OPEN");
        item.setCreatedAt(Instant.now());
        return WishlistItemDto.from(wishlistItemRepository.save(item));
    }

    @Transactional
    public void deleteOwn(Long childId, Long itemId) {
        WishlistItem item = wishlistItemRepository.findById(itemId)
                .orElseThrow(() -> new NotFoundException("Пункт не найден"));
        if (!item.getChild().getId().equals(childId)) {
            throw new NotFoundException("Пункт не найден");
        }
        wishlistItemRepository.delete(item);
    }

    @Transactional
    public WishlistItemDto markDone(Long parentId, Long itemId) {
        WishlistItem item = wishlistItemRepository.findByIdAndChild_ParentId(itemId, parentId)
                .orElseThrow(() -> new NotFoundException("Пункт не найден"));
        item.setStatus("DONE");
        return WishlistItemDto.from(wishlistItemRepository.save(item));
    }

    @Transactional
    public void deleteForParent(Long parentId, Long itemId) {
        wishlistItemRepository.delete(wishlistItemRepository.findByIdAndChild_ParentId(itemId, parentId)
                .orElseThrow(() -> new NotFoundException("Пункт не найден")));
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}