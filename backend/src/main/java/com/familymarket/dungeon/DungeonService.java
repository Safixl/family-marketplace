package com.familymarket.dungeon;

import com.familymarket.balance.BalanceService;
import com.familymarket.child.ChildRepository;
import com.familymarket.common.BadRequestException;
import com.familymarket.common.NotFoundException;
import com.familymarket.dto.SkillProgressDto;
import com.familymarket.skill.SkillService;
import com.familymarket.store.Store;
import com.familymarket.store.StoreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Random;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Логика подземелий: персонаж, разблокировка таверны, выносливость (лимит 09:00 МСК),
 * запуск и продолжение походов, награды и экипировка.
 */
@Service
public class DungeonService {

    private static final List<String> CLASSES = List.of("WARRIOR", "MAGE", "ARCHER");
    private static final Map<String, String> STARTER_WEAPONS = Map.of(
            "WARRIOR", "rusty_sword",
            "MAGE", "apprentice_wand",
            "ARCHER", "oak_bow");

    private final DungeonCharacterRepository characterRepository;
    private final DungeonSessionRepository sessionRepository;
    private final EquipmentDefRepository equipmentDefRepository;
    private final ChildEquipmentRepository childEquipmentRepository;
    private final ChildRepository childRepository;
    private final StoreRepository storeRepository;
    private final BalanceService balanceService;
    private final SkillService skillService;
    private final DungeonEngine engine;
    private final Random random = new Random();

    public DungeonService(DungeonCharacterRepository characterRepository,
                          DungeonSessionRepository sessionRepository,
                          EquipmentDefRepository equipmentDefRepository,
                          ChildEquipmentRepository childEquipmentRepository,
                          ChildRepository childRepository,
                          StoreRepository storeRepository,
                          BalanceService balanceService,
                          SkillService skillService,
                          DungeonEngine engine) {
        this.characterRepository = characterRepository;
        this.sessionRepository = sessionRepository;
        this.equipmentDefRepository = equipmentDefRepository;
        this.childEquipmentRepository = childEquipmentRepository;
        this.childRepository = childRepository;
        this.storeRepository = storeRepository;
        this.balanceService = balanceService;
        this.skillService = skillService;
        this.engine = engine;
    }

    // ---------- Состояние ----------

    @Transactional
    public DungeonDtos.DungeonStateDto state(Long childId) {
        DungeonCharacter character = ensureCharacter(childId);
        refreshCharacter(character);
        DungeonSession session = sessionRepository
                .findFirstByChildIdOrderByStartedAtDesc(childId).orElse(null);

        Map<String, Integer> levels = skillLevels(childId);
        int readingIdx = DungeonCatalog.rankIndexForLevel(levels.getOrDefault("READING", 1));
        // Условие разблокировки: ранг «Железо» по навыку «Чтение»
        boolean unlocked = readingIdx >= 1;
        if (unlocked && "LOCKED".equals(character.getStatus())) {
            character.setStatus("FREE");
        }

        // ----- Ленивый таймлайн: события «проявляются» по мере наступления времени -----
        List<DungeonEngine.LogEntry> entries = session == null ? List.of() : DungeonEngine.parseLog(session);
        boolean timelineDone = timelineFinished(entries);

        if (session != null && timelineDone) {
            // Финал наступил: выдаём награду/рекорд, если ещё не выданы
            claimOutcome(childId, session, character);
            // Продолжение похода после отдыха — когда журнал доигран и настал новый день
            if ("RESTING".equals(session.getStatus()) && session.getResumeDay() != null
                    && !session.getResumeDay().isAfter(DungeonEngine.currentLimitDay())) {
                resumeResting(character, DungeonEngine.currentLimitDay());
                session = sessionRepository.findFirstByChildIdOrderByStartedAtDesc(childId).orElse(null);
                entries = session == null ? List.of() : DungeonEngine.parseLog(session);
                timelineDone = timelineFinished(entries);
            }
        }

        String statusOverride = null;
        Integer staminaOverride = null;
        if (session != null && !timelineDone) {
            // Поход ещё «идёт» в журнале: герой в данже, выносливость тратится постепенно
            statusOverride = "IN_DUNGEON";
            staminaOverride = lazyStamina(entries, character.getStamina());
        }

        DungeonDtos.SessionDto sessionDto = session == null ? null : toSessionDto(session);
        return new DungeonDtos.DungeonStateDto(
                toCharacterDto(character, statusOverride, staminaOverride),
                new DungeonDtos.UnlockDto(unlocked, DungeonCatalog.rankName(readingIdx)),
                sessionDto,
                equipment(childId));
    }

    @Transactional
    public void createCharacter(Long childId, String clazz) {
        DungeonCharacter character = ensureCharacter(childId);
        refreshCharacter(character);
        if (!"FREE".equals(character.getStatus())) {
            throw new BadRequestException("Таверна ещё закрыта: нужен ранг «Железо» по Чтению");
        }
        if (character.getCharacterClass() != null) {
            throw new BadRequestException("Класс уже выбран");
        }
        String normalized = clazz == null ? "" : clazz.trim().toUpperCase(Locale.ROOT);
        if (!CLASSES.contains(normalized)) {
            throw new BadRequestException("Неизвестный класс: " + clazz);
        }
        character.setCharacterClass(normalized);
        // Стартовое оружие класса (уже распознано и надето)
        grantEquipment(childId, STARTER_WEAPONS.get(normalized), true, true);
        characterRepository.save(character);
    }

    // ---------- Поход ----------

    @Transactional
    public DungeonDtos.SessionDto startRun(Long childId, String dungeonCode) {
        DungeonCharacter character = ensureCharacter(childId);
        refreshCharacter(character);
        if (!"FREE".equals(character.getStatus())) {
            throw new BadRequestException("Герой сейчас не может отправиться в поход");
        }
        // Нельзя начать новый поход, пока журнал предыдущего не доигран
        DungeonSession previous = sessionRepository.findFirstByChildIdOrderByStartedAtDesc(childId).orElse(null);
        if (previous != null && !timelineFinished(DungeonEngine.parseLog(previous))) {
            throw new BadRequestException("Предыдущий поход ещё не завершён — следи за журналом приключений");
        }
        if (previous != null) {
            claimOutcome(childId, previous, character);
        }
        if (character.getCharacterClass() == null) {
            throw new BadRequestException("Сначала зарегистрируйся в Таверне и выбери класс");
        }
        if (character.getStamina() < 10) {
            throw new BadRequestException("Слишком мало выносливости — герой должен отдохнуть до утра");
        }
        // Сначала создаём сессию, чтобы получить стабильный seed генерации (id)
        DungeonSession session = new DungeonSession();
        session.setChildId(childId);
        session.setDungeonCode("GENERATED");
        session.setStatus("ACTIVE");
        session.setRoomsTotal(5);
        session.setCurrentRoom(1);
        session = sessionRepository.save(session);

        // Генерация квеста (generateDailyDungeon): ранг по матрице шансов от рекорда игрока
        String rank = DungeonCatalog.rollRank(character.getMaxClearedRank(), random);
        int rankIdx = DungeonCatalog.rankIndex(rank);
        int minLevel = DungeonCatalog.rankMinLevel(rankIdx);
        int maxLevel = DungeonCatalog.rankMaxLevel(rankIdx);
        int monsterLevel = minLevel + random.nextInt(maxLevel - minLevel + 1);
        // Тема/босс генерируются от id сессии — при возобновлении после отдыха всё совпадает
        DungeonCatalog.DungeonDef dungeon = DungeonCatalog.generateDungeon(rank, monsterLevel, new Random(session.getId()));

        session.setDungeonCode(dungeon.code());
        session.setRank(rank);
        session.setMonsterLevel(monsterLevel);
        session.setDungeonName(dungeon.name());
        session.setDungeonEmoji(dungeon.emoji());
        session.setRoomsTotal(dungeon.rooms());
        session = sessionRepository.save(session);

        character.setStatus("IN_DUNGEON");
        characterRepository.save(character);

        List<EquipmentDef> loot = new ArrayList<>();
        Map<String, Integer> levels = skillLevels(childId);
        DungeonEngine.RunContext ctx = new DungeonEngine.RunContext(
                dungeon,
                new DungeonEngine.SkillLevels(
                        levels.getOrDefault("LANG", 1),
                        levels.getOrDefault("LOGIC", 1),
                        levels.getOrDefault("SPORT", 1)),
                gearCoef(childId),
                character.getCharacterClass(),
                () -> pickLoot(dungeon.tier()));
        engine.simulate(session, character, ctx, loot, false);
        persistLoot(childId, loot);
        // Награда за зачистку выдаётся позже — когда таймлайн журнала доиграет финал

        sessionRepository.save(session);
        characterRepository.save(character);
        return toSessionDto(session);
    }

    /**
     * Ежедневное начисление выносливости в 09:00 МСК и продолжение походов героев,
     * остановившихся на отдых.
     */
    @Transactional
    public void dailyRefresh() {
        LocalDate day = DungeonEngine.currentLimitDay();
        List<DungeonCharacter> all = characterRepository.findAll();
        for (DungeonCharacter character : all) {
            refreshCharacter(character);
            if ("RESTING".equals(character.getStatus())) {
                resumeResting(character, day);
            }
            characterRepository.save(character);
        }
    }

    /** Продолжение похода героя, заснувшего в данже (вызывается после восстановления энергии). */
    private void resumeResting(DungeonCharacter character, LocalDate limitDay) {
        DungeonSession session = sessionRepository
                .findFirstByChildIdAndStatusInOrderByStartedAtDesc(character.getChildId(), List.of("RESTING"))
                .orElse(null);
        if (session == null || !limitDay.equals(session.getResumeDay())) {
            return;
        }
        if (!timelineFinished(DungeonEngine.parseLog(session))) {
            return; // таймлайн ещё играется — герой продолжает путь позже
        }
        Map<String, Integer> levels = skillLevels(character.getChildId());
        // Данж восстанавливается детерминированно (та же тема/босс, что и при старте)
        DungeonCatalog.DungeonDef dungeon = DungeonCatalog.generateDungeon(
                session.getRank(), session.getMonsterLevel(), new Random(sessionSeed(session)));
        character.setStatus("IN_DUNGEON");
        List<EquipmentDef> loot = new ArrayList<>();
        DungeonEngine.RunContext ctx = new DungeonEngine.RunContext(
                dungeon,
                new DungeonEngine.SkillLevels(
                        levels.getOrDefault("LANG", 1),
                        levels.getOrDefault("LOGIC", 1),
                        levels.getOrDefault("SPORT", 1)),
                gearCoef(character.getChildId()),
                character.getCharacterClass(),
                () -> pickLoot(dungeon.tier()));
        engine.simulate(session, character, ctx, loot, true);
        persistLoot(character.getChildId(), loot);
        // Награда выдаётся позже — когда доиграет продолжение таймлайна
        sessionRepository.save(session);
        characterRepository.save(character);
    }

    // ---------- Экипировка ----------

    @Transactional
    public void identify(Long childId, Long itemId) {
        ChildEquipment item = childEquipmentRepository.findByIdAndChildId(itemId, childId)
                .orElseThrow(() -> new NotFoundException("Предмет не найден"));
        item.setIdentified(true);
        childEquipmentRepository.save(item);
    }

    @Transactional
    public void toggleEquip(Long childId, Long itemId) {
        DungeonCharacter character = ensureCharacter(childId);
        if ("IN_DUNGEON".equals(character.getStatus()) || "RESTING".equals(character.getStatus())) {
            throw new BadRequestException("Нельзя менять снаряжение в походе");
        }
        ChildEquipment item = childEquipmentRepository.findByIdAndChildId(itemId, childId)
                .orElseThrow(() -> new NotFoundException("Предмет не найден"));
        if (!item.isIdentified()) {
            throw new BadRequestException("Сначала определи вещь у мудреца в таверне");
        }
        if (!item.isEquipped()) {
            // Снимаем предметы того же слота
            String slot = item.getEquipment().getSlot();
            for (ChildEquipment other : childEquipmentRepository.findByChildIdAndEquippedTrue(childId)) {
                if (other.getEquipment().getSlot().equals(slot)) {
                    other.setEquipped(false);
                    childEquipmentRepository.save(other);
                }
            }
        }
        item.setEquipped(!item.isEquipped());
        childEquipmentRepository.save(item);
    }

    // ---------- Внутреннее ----------

    private DungeonCharacter ensureCharacter(Long childId) {
        return characterRepository.findByChildId(childId).orElseGet(() -> {
            DungeonCharacter c = new DungeonCharacter();
            c.setChildId(childId);
            return characterRepository.save(c);
        });
    }

    /**
     * Восстановление выносливости: лимит обновляется каждый день ровно в 09:00 МСК.
     * Максимум = 100% + 10% за каждый ранг «Хозяйственности» начиная с «Железа».
     */
    private void refreshCharacter(DungeonCharacter character) {
        Map<String, Integer> levels = skillLevels(character.getChildId());
        int houseIdx = DungeonCatalog.rankIndexForLevel(levels.getOrDefault("HOUSE", 1));
        int bonus = Math.max(0, houseIdx * 10); // Железо = +10%, Бронза = +20% и т.д.
        character.setMaxStaminaBonus(bonus);

        LocalDate day = DungeonEngine.currentLimitDay();
        if (character.getLastRefreshDay() == null || character.getLastRefreshDay().isBefore(day)) {
            character.setStamina(100 + bonus);
            character.setLastRefreshDay(day);
        }
    }

    /** Уровни навыков (1..60) по прогрессу 0..100. */
    private Map<String, Integer> skillLevels(Long childId) {
        return skillService.progress(childId).stream()
                .collect(Collectors.toMap(SkillProgressDto::skill,
                        p -> DungeonCatalog.skillLevelFromProgress(p.progress())));
    }

    /** Коэффициент снаряжения: «голый» герой — 0.1, экипированный — 1.0 и выше. */
    private double gearCoef(Long childId) {
        double sum = childEquipmentRepository.findByChildIdAndEquippedTrue(childId).stream()
                .filter(ChildEquipment::isIdentified)
                .mapToDouble(i -> i.getEquipment().getStatMultiplier().doubleValue())
                .sum();
        if (sum <= 0) {
            return 0.1;
        }
        return Math.max(1.0, sum);
    }

    /** Случайная нераспознанная экипировка с весами редкости (лучше данж — лучше лут). */
    private EquipmentDef pickLoot(int tier) {
        List<EquipmentDef> all = equipmentDefRepository.findAll();
        if (all.isEmpty()) {
            return null;
        }
        Map<String, List<EquipmentDef>> byRarity = all.stream()
                .collect(Collectors.groupingBy(EquipmentDef::getRarity));
        int wCommon = 50;
        int wUncommon = 25 + 5 * tier;
        int wRare = 12 + 4 * tier;
        int wEpic = 5 + 3 * tier;
        int wLegendary = 1 + 2 * tier;
        int total = wCommon + wUncommon + wRare + wEpic + wLegendary;
        int roll = random.nextInt(total);
        String rarity;
        if (roll < wLegendary) {
            rarity = "LEGENDARY";
        } else if (roll < wLegendary + wEpic) {
            rarity = "EPIC";
        } else if (roll < wLegendary + wEpic + wRare) {
            rarity = "RARE";
        } else if (roll < wLegendary + wEpic + wRare + wUncommon) {
            rarity = "UNCOMMON";
        } else {
            rarity = "COMMON";
        }
        List<EquipmentDef> pool = byRarity.getOrDefault(rarity, all);
        return pool.get(random.nextInt(pool.size()));
    }

    private void persistLoot(Long childId, List<EquipmentDef> loot) {
        for (EquipmentDef def : loot) {
            ChildEquipment item = new ChildEquipment();
            item.setChildId(childId);
            item.setEquipment(def);
            item.setIdentified(false);
            item.setEquipped(false);
            childEquipmentRepository.save(item);
        }
    }

    private void grantEquipment(Long childId, String code, boolean identified, boolean equipped) {
        equipmentDefRepository.findByCode(code).ifPresent(def -> {
            ChildEquipment item = new ChildEquipment();
            item.setChildId(childId);
            item.setEquipment(def);
            item.setIdentified(identified);
            item.setEquipped(equipped);
            childEquipmentRepository.save(item);
        });
    }

    /**
     * Выдача награды за зачистку (после того как таймлайн журнала доиграл финал):
     * монеты в магазин «Дом» (или первый активный магазин семьи) + рекорд ранга.
     */
    private void claimOutcome(Long childId, DungeonSession session, DungeonCharacter character) {
        if (session.isRewardClaimed() || !"WON".equals(session.getStatus())) {
            return; // поражение/отдых награды не дают
        }
        session.setRewardClaimed(true);
        sessionRepository.save(session);
        character.setVictories(character.getVictories() + 1);
        onDungeonClear(character, session.getRank());
        characterRepository.save(character);
        Long parentId = childRepository.findParentIdById(childId).orElse(null);
        if (parentId == null || session.getRewardCoins().signum() <= 0) {
            return;
        }
        Store store = storeRepository.findByParentIdAndTemplateType(parentId, "HOME")
                .or(() -> storeRepository.findByParentIdAndActiveTrueOrderByCreatedAtAsc(parentId).stream()
                        .findFirst())
                .orElse(null);
        if (store != null) {
            balanceService.credit(childId, store.getId(), session.getRewardCoins());
        }
    }

    /** Таймлайн доигран: время последнего события уже наступило. */
    private boolean timelineFinished(List<DungeonEngine.LogEntry> entries) {
        if (entries.isEmpty()) {
            return true;
        }
        try {
            return !Instant.parse(entries.get(entries.size() - 1).at()).isAfter(Instant.now());
        } catch (Exception e) {
            return true;
        }
    }

    /**
     * Выносливость «на сейчас»: остаток по последнему наступившему событию лога
     * (записи без stamina — старый формат — игнорируются).
     */
    private int lazyStamina(List<DungeonEngine.LogEntry> entries, int fallback) {
        Instant now = Instant.now();
        int stamina = -1;
        for (DungeonEngine.LogEntry e : entries) {
            try {
                if (Instant.parse(e.at()).isAfter(now)) {
                    break;
                }
            } catch (Exception ex) {
                continue;
            }
            if (e.stamina() > 0) {
                stamina = e.stamina();
            }
        }
        return stamina >= 0 ? stamina : fallback;
    }

    /**
     * Триггер успешного завершения данжа: если ранг только что пройденного данжа
     * выше рекорда, max_cleared_rank перезаписывается новым значением.
     */
    private void onDungeonClear(DungeonCharacter character, String clearedRank) {
        int cleared = DungeonCatalog.rankIndex(clearedRank);
        int record = DungeonCatalog.rankIndex(character.getMaxClearedRank());
        if (cleared > record) {
            character.setMaxClearedRank(clearedRank);
        }
    }

    /** Стабильное зерно генерации темы/босса данжа — id сессии. */
    private long sessionSeed(DungeonSession session) {
        return session.getId();
    }

    private DungeonDtos.CharacterDto toCharacterDto(DungeonCharacter character, String statusOverride, Integer staminaOverride) {
        return new DungeonDtos.CharacterDto(
                character.getCharacterClass(),
                statusOverride != null ? statusOverride : character.getStatus(),
                staminaOverride != null ? staminaOverride : character.getStamina(),
                100 + character.getMaxStaminaBonus(),
                character.getVictories(),
                character.getMaxClearedRank());
    }

    private DungeonDtos.SessionDto toSessionDto(DungeonSession session) {
        List<DungeonEngine.LogEntry> entries = DungeonEngine.parseLog(session);
        // Пока таймлайн не доигран — сессия для игрока всё ещё «идёт»
        String effectiveStatus = timelineFinished(entries) ? session.getStatus() : "ACTIVE";
        return new DungeonDtos.SessionDto(
                session.getId(),
                session.getDungeonCode(),
                session.getRank(),
                session.getMonsterLevel(),
                session.getDungeonName() != null ? session.getDungeonName() : session.getDungeonCode(),
                session.getDungeonEmoji() != null ? session.getDungeonEmoji() : "🗺️",
                effectiveStatus,
                session.getCurrentRoom(),
                session.getRoomsTotal(),
                session.getRewardCoins(),
                entries.stream()
                        .sorted(Comparator.comparing(DungeonEngine.LogEntry::at))
                        .map(e -> new DungeonDtos.LogEntryDto(e.at(), e.icon(), e.text(), e.stamina()))
                        .toList());
    }

    private List<DungeonDtos.EquipmentDto> equipment(Long childId) {
        return childEquipmentRepository.findByChildIdOrderByAcquiredAtDesc(childId).stream()
                .map(item -> new DungeonDtos.EquipmentDto(
                        item.getId(),
                        item.getEquipment().getCode(),
                        item.isIdentified() ? item.getEquipment().getName() : "Нераспознанная вещь",
                        item.getEquipment().getSlot(),
                        item.getEquipment().getRarity(),
                        item.getEquipment().getStatMultiplier().doubleValue(),
                        item.isIdentified() ? item.getEquipment().getIcon() : "❔",
                        item.isIdentified() ? item.getEquipment().getDescription() : "Мудрец в таверне определит, что это",
                        item.isIdentified(),
                        item.isEquipped()))
                .toList();
    }
}
