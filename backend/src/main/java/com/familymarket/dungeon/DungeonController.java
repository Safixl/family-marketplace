package com.familymarket.dungeon;

import com.familymarket.common.CurrentUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/child/dungeon")
public class DungeonController {

    private final DungeonService dungeonService;

    public DungeonController(DungeonService dungeonService) {
        this.dungeonService = dungeonService;
    }

    /** Полное состояние: персонаж, выносливость, разблокировка, сессия, каталог, экипировка. */
    @GetMapping
    public DungeonDtos.DungeonStateDto state() {
        return dungeonService.state(CurrentUser.childId());
    }

    /** Регистрация Авантюриста в Таверне: выбор класса (Воин / Маг / Лучник). */
    @PostMapping("/character")
    public void createCharacter(@RequestBody Map<String, String> body) {
        dungeonService.createCharacter(CurrentUser.childId(), body.get("clazz"));
    }

    /** Отправка героя в данж: движок рассчитывает всю цепочку событий наперёд. */
    @PostMapping("/start")
    public DungeonDtos.SessionDto start(@RequestBody Map<String, String> body) {
        return dungeonService.startRun(CurrentUser.childId(), body.get("code"));
    }

    /** Определение нераспознанной вещи у мудреца в таверне. */
    @PostMapping("/equipment/{id}/identify")
    public void identify(@PathVariable Long id) {
        dungeonService.identify(CurrentUser.childId(), id);
    }

    /** Надеть / снять экипировку. */
    @PostMapping("/equipment/{id}/equip")
    public void toggleEquip(@PathVariable Long id) {
        dungeonService.toggleEquip(CurrentUser.childId(), id);
    }
}
