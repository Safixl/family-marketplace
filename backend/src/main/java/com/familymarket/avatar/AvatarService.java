package com.familymarket.avatar;

import com.familymarket.child.Child;
import com.familymarket.child.ChildRepository;
import com.familymarket.common.BadRequestException;
import com.familymarket.common.NotFoundException;
import com.familymarket.dto.AvatarItemDto;
import com.familymarket.dto.AvatarItemUpsertRequest;
import com.familymarket.dto.ChildAvatarItemDto;
import com.familymarket.user.User;
import com.familymarket.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * «Гардероб Героя»: цифровая кастомизация аватара.
 * Родитель создаёт каталог предметов и выдаёт их детям (за ачивки, квесты или вручную).
 * Ребёнок надевает/снимает предметы — это видно в его профиле.
 */
@Service
public class AvatarService {

    private final AvatarItemRepository itemRepository;
    private final ChildAvatarItemRepository childItemRepository;
    private final UserRepository userRepository;
    private final ChildRepository childRepository;

    public AvatarService(AvatarItemRepository itemRepository,
                         ChildAvatarItemRepository childItemRepository,
                         UserRepository userRepository,
                         ChildRepository childRepository) {
        this.itemRepository = itemRepository;
        this.childItemRepository = childItemRepository;
        this.userRepository = userRepository;
        this.childRepository = childRepository;
    }

    // ---------- Родитель: каталог ----------

    @Transactional(readOnly = true)
    public List<AvatarItemDto> listCatalog(Long parentId) {
        return itemRepository.findByParentIdOrderByCategoryAscCreatedAtAsc(parentId)
                .stream().map(AvatarItemDto::from).toList();
    }

    @Transactional
    public AvatarItemDto create(Long parentId, AvatarItemUpsertRequest request) {
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));
        AvatarItem item = new AvatarItem();
        item.setParent(parent);
        item.setName(request.name().trim());
        item.setDescription(request.description());
        item.setCategory(normalizeCategory(request.category()));
        item.setIcon(request.icon() == null || request.icon().isBlank() ? "🎨" : request.icon().trim());
        item.setCreatedAt(Instant.now());
        return AvatarItemDto.from(itemRepository.save(item));
    }

    @Transactional
    public void delete(Long parentId, Long itemId) {
        AvatarItem item = getOwned(parentId, itemId);
        itemRepository.delete(item);
    }

    /** Выдать предмет ребёнку (вручную ГМом). */
    @Transactional
    public ChildAvatarItemDto grant(Long parentId, Long itemId, Long childId) {
        AvatarItem item = getOwned(parentId, itemId);
        Child child = childRepository.findByIdAndParentId(childId, parentId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        if (childItemRepository.existsByChildIdAndItemId(childId, itemId)) {
            throw new BadRequestException("Предмет уже выдан этому ребёнку");
        }
        ChildAvatarItem granted = new ChildAvatarItem();
        granted.setChild(child);
        granted.setItem(item);
        granted.setEquipped(false);
        granted.setUnlockedAt(Instant.now());
        return ChildAvatarItemDto.from(childItemRepository.save(granted));
    }

    // ---------- Ребёнок: гардероб ----------

    @Transactional(readOnly = true)
    public List<ChildAvatarItemDto> myWardrobe(Long childId) {
        return childItemRepository.findByChildIdOrderByUnlockedAtDesc(childId)
                .stream().map(ChildAvatarItemDto::from).toList();
    }

    /** Надеть/снять предмет. В каждой категории надет максимум один предмет. */
    @Transactional
    public ChildAvatarItemDto equip(Long childId, Long childItemId, boolean equipped) {
        ChildAvatarItem childItem = childItemRepository.findById(childItemId)
                .filter(c -> c.getChild().getId().equals(childId))
                .orElseThrow(() -> new NotFoundException("Предмет не найден"));
        if (equipped) {
            // снимаем другие надетые предметы той же категории
            for (ChildAvatarItem other : childItemRepository.findEquippedByChildId(childId)) {
                if (other.getItem().getCategory().equals(childItem.getItem().getCategory()) && !other.getId().equals(childItemId)) {
                    other.setEquipped(false);
                    childItemRepository.save(other);
                }
            }
            childItem.setEquipped(true);
        } else {
            childItem.setEquipped(false);
        }
        return ChildAvatarItemDto.from(childItemRepository.save(childItem));
    }

    private AvatarItem getOwned(Long parentId, Long itemId) {
        return itemRepository.findById(itemId)
                .filter(i -> i.getParent().getId().equals(parentId))
                .orElseThrow(() -> new NotFoundException("Предмет не найден"));
    }

    private String normalizeCategory(String category) {
        if (category == null || category.isBlank()) {
            return "SKIN";
        }
        String normalized = category.trim().toUpperCase();
        return switch (normalized) {
            case "SKIN", "FRAME", "PET", "BACKGROUND" -> normalized;
            default -> "SKIN";
        };
    }
}
