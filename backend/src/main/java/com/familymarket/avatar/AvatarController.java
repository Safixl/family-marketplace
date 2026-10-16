package com.familymarket.avatar;

import com.familymarket.common.CurrentUser;
import com.familymarket.dto.AvatarItemDto;
import com.familymarket.dto.AvatarItemUpsertRequest;
import com.familymarket.dto.ChildAvatarItemDto;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class AvatarController {

    private final AvatarService avatarService;

    public AvatarController(AvatarService avatarService) {
        this.avatarService = avatarService;
    }

    // ---------- Родитель ----------

    @GetMapping("/api/parent/avatar-items")
    public List<AvatarItemDto> listCatalog() {
        return avatarService.listCatalog(CurrentUser.parentId());
    }

    @PostMapping("/api/parent/avatar-items")
    public AvatarItemDto create(@RequestBody AvatarItemUpsertRequest request) {
        return avatarService.create(CurrentUser.parentId(), request);
    }

    @DeleteMapping("/api/parent/avatar-items/{id}")
    public void delete(@PathVariable Long id) {
        avatarService.delete(CurrentUser.parentId(), id);
    }

    @PostMapping("/api/parent/avatar-items/{id}/grant")
    public ChildAvatarItemDto grant(@PathVariable Long id, @RequestParam Long childId) {
        return avatarService.grant(CurrentUser.parentId(), id, childId);
    }

    // ---------- Ребёнок ----------

    @GetMapping("/api/child/wardrobe")
    public List<ChildAvatarItemDto> myWardrobe() {
        return avatarService.myWardrobe(CurrentUser.childId());
    }

    @PutMapping("/api/child/wardrobe/{id}/equip")
    public ChildAvatarItemDto equip(@PathVariable Long id, @RequestParam boolean equipped) {
        return avatarService.equip(CurrentUser.childId(), id, equipped);
    }
}
