package com.familymarket.limit;

import com.familymarket.child.Child;
import com.familymarket.child.ChildRepository;
import com.familymarket.common.BadRequestException;
import com.familymarket.common.NotFoundException;
import com.familymarket.dto.ChildLimitsDto;
import com.familymarket.dto.ChildLimitsUpdateRequest;
import com.familymarket.dto.CustomLimitDto;
import com.familymarket.dto.CustomLimitInput;
import com.familymarket.dto.LimitEventDto;
import com.familymarket.dto.LimitStateDto;
import com.familymarket.dto.LimitTypeState;
import com.familymarket.dto.PocketRequestCreateRequest;
import com.familymarket.dto.PocketRequestDto;
import com.familymarket.dto.PocketState;
import com.familymarket.notification.NotificationService;
import com.familymarket.product.Product;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class LimitService {

    private static final ZoneId ZONE = ZoneId.of("Europe/Moscow");
    private static final List<String> TIME_LIMIT_TYPES = List.of("TV", "PC", "CONSOLE", "PHONE", "TABLET");
    /** Слоты кастомных лимитов. */
    private static final List<String> CUSTOM_TYPES = List.of("C1", "C2", "C3");
    /** Максимум кастомных лимитов на ребёнка. */
    private static final int MAX_CUSTOM_LIMITS = 3;

    private final ChildLimitRepository childLimitRepository;
    private final LimitUsageRepository limitUsageRepository;
    private final LimitFreezeRepository limitFreezeRepository;
    private final LimitEventRepository limitEventRepository;
    private final PocketRequestRepository pocketRequestRepository;
    private final PocketDisbursementRepository pocketDisbursementRepository;
    private final PocketExtensionRepository pocketExtensionRepository;
    private final ChildRepository childRepository;
    private final NotificationService notificationService;

    public LimitService(ChildLimitRepository childLimitRepository,
                        LimitUsageRepository limitUsageRepository,
                        LimitFreezeRepository limitFreezeRepository,
                        LimitEventRepository limitEventRepository,
                        PocketRequestRepository pocketRequestRepository,
                        PocketDisbursementRepository pocketDisbursementRepository,
                        PocketExtensionRepository pocketExtensionRepository,
                        ChildRepository childRepository,
                        NotificationService notificationService) {
        this.childLimitRepository = childLimitRepository;
        this.limitUsageRepository = limitUsageRepository;
        this.limitFreezeRepository = limitFreezeRepository;
        this.limitEventRepository = limitEventRepository;
        this.pocketRequestRepository = pocketRequestRepository;
        this.pocketDisbursementRepository = pocketDisbursementRepository;
        this.pocketExtensionRepository = pocketExtensionRepository;
        this.childRepository = childRepository;
        this.notificationService = notificationService;
    }

    // ---------- Время ----------

    /** День лимита: начинается в 09:00 МСК (до 09:00 действует вчерашний день). */
    private LocalDate limitDay(Instant now) {
        ZonedDateTime msk = now.atZone(ZONE);
        ZonedDateTime dayStart = msk.toLocalDate().atTime(9, 0).atZone(ZONE);
        return msk.isBefore(dayStart) ? msk.toLocalDate().minusDays(1) : msk.toLocalDate();
    }

    /** Неделя карманных денег: понедельник 09:00 МСК. */
    private LocalDate weekStart(Instant now) {
        ZonedDateTime msk = now.atZone(ZONE);
        LocalDate date = msk.toLocalDate();
        ZonedDateTime monday9 = date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atTime(9, 0).atZone(ZONE);
        if (msk.isBefore(monday9)) {
            date = date.minusDays(1);
            monday9 = date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atTime(9, 0).atZone(ZONE);
        }
        return monday9.toLocalDate();
    }

    private LimitUsage usageFor(Long childId, String type, LocalDate day) {
        return limitUsageRepository.findByChildIdAndLimitTypeAndDay(childId, type, day)
                .orElseGet(() -> {
                    LimitUsage u = new LimitUsage();
                    u.setChild(childRepository.getReferenceById(childId));
                    u.setLimitType(type);
                    u.setDay(day);
                    return u;
                });
    }

    /** Настройки лимитов (никогда не null). */
    private LimitSettings settings(ChildLimit cl) {
        LimitSettings s = cl.getSettings();
        return s == null ? new LimitSettings() : s;
    }

    private int baseMinutes(ChildLimit cl, String type) {
        return switch (type) {
            case "TV" -> cl.getTvMinutes();
            case "PC" -> cl.getPcMinutes();
            case "CONSOLE" -> cl.getConsoleMinutes();
            case "PHONE" -> cl.getPhoneMinutes();
            case "TABLET" -> cl.getTabletMinutes();
            default -> customLimit(settings(cl), type).map(LimitSettings.CustomLimit::getMinutes).orElse(0);
        };
    }

    private void setBaseMinutes(ChildLimit cl, String type, int value) {
        switch (type) {
            case "TV" -> cl.setTvMinutes(value);
            case "PC" -> cl.setPcMinutes(value);
            case "CONSOLE" -> cl.setConsoleMinutes(value);
            case "PHONE" -> cl.setPhoneMinutes(value);
            case "TABLET" -> cl.setTabletMinutes(value);
            default -> {
                LimitSettings s = settings(cl);
                LimitSettings.CustomLimit c = customLimit(s, type)
                        .orElseThrow(() -> new BadRequestException("Неизвестный тип лимита: " + type));
                c.setMinutes(value);
                cl.setSettings(s);
            }
        }
    }

    private java.util.Optional<LimitSettings.CustomLimit> customLimit(LimitSettings settings, String type) {
        return settings.getCustom().stream().filter(c -> type.equals(c.getId())).findFirst();
    }

    /** Валидация типа из запроса: стандартный или кастомный слот этого ребёнка. */
    private String normalizeType(ChildLimit cl, String type) {
        String t = type.trim().toUpperCase();
        if (TIME_LIMIT_TYPES.contains(t) || customLimit(settings(cl), t).isPresent()) {
            return t;
        }
        throw new BadRequestException("Неизвестный тип лимита: " + type);
    }

    /** Валидация типа для эффектов товаров/уведомлений: только стандартные. */
    private String normalizeStandardType(String type) {
        String t = type.trim().toUpperCase();
        if (!TIME_LIMIT_TYPES.contains(t)) {
            throw new BadRequestException("Неизвестный тип лимита: " + type);
        }
        return t;
    }

    /** Название лимита для уведомлений и логов. */
    private String labelOf(ChildLimit cl, String type) {
        return switch (type) {
            case "TV" -> "ТВ";
            case "PC" -> "Компьютер";
            case "CONSOLE" -> "Консоль";
            case "PHONE" -> "Телефон";
            case "TABLET" -> "Планшет";
            default -> customLimit(settings(cl), type).map(LimitSettings.CustomLimit::getName).orElse(type);
        };
    }

    /** Включён ли лимит (стандартный — по списку disabled, кастомный — по своему флагу). */
    private boolean isEnabled(LimitSettings settings, String type) {
        if (TIME_LIMIT_TYPES.contains(type)) {
            return !settings.getDisabled().contains(type);
        }
        return customLimit(settings, type).map(LimitSettings.CustomLimit::isEnabled).orElse(false);
    }

    // ---------- Родитель ----------

    @Transactional(readOnly = true)
    public ChildLimitsDto getChildLimits(Long parentId, Long childId) {
        childRepository.findByIdAndParentId(childId, parentId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        ChildLimit cl = childLimitRepository.findById(childId).orElseGet(ChildLimit::new);
        LimitSettings st = settings(cl);
        return new ChildLimitsDto(childId, cl.getTvMinutes(), cl.getPcMinutes(), cl.getConsoleMinutes(),
                cl.getPhoneMinutes(), cl.getTabletMinutes(), cl.getPocketWeekly(),
                List.copyOf(st.getDisabled()), toCustomDtos(st));
    }

    @Transactional
    public ChildLimitsDto updateChildLimits(Long parentId, Long childId, ChildLimitsUpdateRequest request) {
        childRepository.findByIdAndParentId(childId, parentId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        ChildLimit cl = childLimitRepository.findById(childId).orElseGet(ChildLimit::new);
        cl.setChildId(childId);
        if (request.tvMinutes() != null) cl.setTvMinutes(request.tvMinutes());
        if (request.pcMinutes() != null) cl.setPcMinutes(request.pcMinutes());
        if (request.consoleMinutes() != null) cl.setConsoleMinutes(request.consoleMinutes());
        if (request.phoneMinutes() != null) cl.setPhoneMinutes(request.phoneMinutes());
        if (request.tabletMinutes() != null) cl.setTabletMinutes(request.tabletMinutes());
        if (request.pocketWeekly() != null) cl.setPocketWeekly(request.pocketWeekly());

        LimitSettings st = settings(cl);
        if (request.disabledTypes() != null) {
            Set<String> disabled = new HashSet<>();
            for (String t : request.disabledTypes()) {
                disabled.add(normalizeStandardType(t));
            }
            st.setDisabled(disabled);
        }
        if (request.customLimits() != null) {
            st.setCustom(applyCustomLimits(request.customLimits()));
        }
        cl.setSettings(st);

        cl.setUpdatedAt(Instant.now());
        childLimitRepository.save(cl);
        return getChildLimits(parentId, childId);
    }

    private List<CustomLimitDto> toCustomDtos(LimitSettings st) {
        return st.getCustom().stream()
                .map(c -> new CustomLimitDto(c.getId(), c.getName(), c.getMinutes(), c.isEnabled()))
                .toList();
    }

    /** Валидация и нормализация списка кастомных лимитов от родителя (максимум 3, слоты C1..C3). */
    private List<LimitSettings.CustomLimit> applyCustomLimits(List<CustomLimitInput> inputs) {
        if (inputs.size() > MAX_CUSTOM_LIMITS) {
            throw new BadRequestException("Кастомных лимитов может быть не больше " + MAX_CUSTOM_LIMITS);
        }
        List<LimitSettings.CustomLimit> result = new ArrayList<>();
        for (CustomLimitInput in : inputs) {
            String name = in.name() == null ? "" : in.name().trim();
            if (name.isEmpty()) {
                throw new BadRequestException("Укажите название лимита");
            }
            int minutes = in.minutes() == null ? 0 : Math.max(0, in.minutes());
            boolean enabled = in.enabled() == null || in.enabled();
            String id = resolveCustomId(in.id(), result);
            result.add(new LimitSettings.CustomLimit(id, name, minutes, enabled));
        }
        return result;
    }

    /** Подбор слота C1..C3: сохраняем переданный валидный id, иначе первый свободный. */
    private String resolveCustomId(String id, List<LimitSettings.CustomLimit> existing) {
        Set<String> taken = existing.stream().map(LimitSettings.CustomLimit::getId)
                .collect(java.util.stream.Collectors.toSet());
        if (id != null && CUSTOM_TYPES.contains(id.trim().toUpperCase()) && !taken.contains(id.trim().toUpperCase())) {
            return id.trim().toUpperCase();
        }
        for (String slot : CUSTOM_TYPES) {
            if (!taken.contains(slot)) {
                return slot;
            }
        }
        throw new BadRequestException("Кастомных лимитов может быть не больше " + MAX_CUSTOM_LIMITS);
    }

    // ---------- Ребенок ----------

    @Transactional
    public LimitStateDto getState(Long childId) {
        ChildLimit cl = childLimitRepository.findById(childId).orElseGet(ChildLimit::new);
        LimitSettings st = settings(cl);
        Instant now = Instant.now();
        LocalDate day = limitDay(now);
        List<LimitTypeState> limits = new ArrayList<>();
        for (String type : TIME_LIMIT_TYPES) {
            int base = baseMinutes(cl, type);
            boolean enabled = isEnabled(st, type);
            if (!enabled) {
                // Выключенный лимит: счётчики не читаем, ребёнок его не видит
                limits.add(new LimitTypeState(type, base, 0, 0, base * 60, false, false, false, null));
                continue;
            }
            autoStopIfExceeded(childId, type); // исчерпанный таймер останавливается сам
            LimitUsage usage = usageFor(childId, type, day);
            int used = usage.getUsedSeconds();
            if (usage.isRunning() && usage.getStartedAt() != null) {
                used += (int) Math.max(0, Duration.between(usage.getStartedAt(), now).getSeconds());
            }
            int remaining = Math.max(0, base * 60 + usage.getExtendedSeconds() - used);
            boolean frozen = limitFreezeRepository.findByChildIdAndLimitType(childId, type)
                    .map(LimitFreeze::isFrozen).orElse(false);
            limits.add(new LimitTypeState(type, base, used, usage.getExtendedSeconds(),
                    remaining, usage.isRunning(), frozen, true, null));
        }
        for (LimitSettings.CustomLimit c : st.getCustom()) {
            int base = c.getMinutes();
            if (!c.isEnabled()) {
                limits.add(new LimitTypeState(c.getId(), base, 0, 0, base * 60, false, false, false, c.getName()));
                continue;
            }
            autoStopIfExceeded(childId, c.getId());
            LimitUsage usage = usageFor(childId, c.getId(), day);
            int used = usage.getUsedSeconds();
            if (usage.isRunning() && usage.getStartedAt() != null) {
                used += (int) Math.max(0, Duration.between(usage.getStartedAt(), now).getSeconds());
            }
            int remaining = Math.max(0, base * 60 + usage.getExtendedSeconds() - used);
            boolean frozen = limitFreezeRepository.findByChildIdAndLimitType(childId, c.getId())
                    .map(LimitFreeze::isFrozen).orElse(false);
            limits.add(new LimitTypeState(c.getId(), base, used, usage.getExtendedSeconds(),
                    remaining, usage.isRunning(), frozen, true, c.getName()));
        }
        LocalDate weekStart = weekStart(now);
        BigDecimal spent = pocketDisbursementRepository.findByChildIdAndWeekStart(childId, weekStart)
                .stream().map(PocketDisbursement::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal extended = pocketExtensionRepository.findByChildIdAndWeekStart(childId, weekStart)
                .map(PocketExtension::getAmount).orElse(BigDecimal.ZERO);
        BigDecimal weekly = BigDecimal.valueOf(cl.getPocketWeekly());
        BigDecimal remaining = weekly.add(extended).subtract(spent).max(BigDecimal.ZERO);
        return new LimitStateDto(limits, new PocketState(cl.getPocketWeekly(), spent, remaining));
    }

    @Transactional
    public void startTimer(Long childId, String type) {
        ChildLimit cl = childLimitRepository.findById(childId).orElseGet(ChildLimit::new);
        String t = normalizeType(cl, type);
        if (!isEnabled(settings(cl), t)) {
            throw new BadRequestException("Лимит отключён родителем");
        }
        if (limitFreezeRepository.findByChildIdAndLimitType(childId, t)
                .map(LimitFreeze::isFrozen).orElse(false)) {
            throw new BadRequestException("Лимит заморожен родителем");
        }
        autoStopIfExceeded(childId, t);
        LimitUsage usage = usageFor(childId, t, limitDay(Instant.now()));
        if (!usage.isRunning()) {
            int limitSeconds = baseMinutes(cl, t) * 60 + usage.getExtendedSeconds();
            if (limitSeconds > 0 && usage.getUsedSeconds() >= limitSeconds) {
                throw new BadRequestException("Лимит на сегодня исчерпан");
            }
            usage.setRunning(true);
            usage.setStartedAt(Instant.now());
            limitUsageRepository.save(usage);
            recordEvent(childId, t, "START", 0);
        }
    }

    @Transactional
    public void stopTimer(Long childId, String type) {
        ChildLimit cl = childLimitRepository.findById(childId).orElseGet(ChildLimit::new);
        String t = normalizeType(cl, type);
        LimitUsage usage = usageFor(childId, t, limitDay(Instant.now()));
        if (usage.isRunning() && usage.getStartedAt() != null) {
            int seconds = (int) Math.max(0, Duration.between(usage.getStartedAt(), Instant.now()).getSeconds());
            int limitSeconds = baseMinutes(cl, t) * 60 + usage.getExtendedSeconds();
            int usedBefore = usage.getUsedSeconds();
            usage.setUsedSeconds(usedBefore + seconds);
            int usedAfter = usage.getUsedSeconds();
            usage.setRunning(false);
            usage.setStartedAt(null);
            limitUsageRepository.save(usage);
            recordEvent(childId, t, "STOP", seconds);
            notifyLimitExceeded(childId, t, labelOf(cl, t), usedBefore, usedAfter, limitSeconds);
        }
    }

    /**
     * Авто-остановка: если таймер тикает дольше выделенного времени (базовый лимит
     * + покупные расширения), фиксируем исчерпание и создаём родителю уведомление LIMIT_<TYPE>.
     */
    private boolean autoStopIfExceeded(Long childId, String type) {
        LimitUsage usage = usageFor(childId, type, limitDay(Instant.now()));
        if (!usage.isRunning() || usage.getStartedAt() == null) {
            return false;
        }
        ChildLimit cl = childLimitRepository.findById(childId).orElseGet(ChildLimit::new);
        int limitSeconds = baseMinutes(cl, type) * 60 + usage.getExtendedSeconds();
        if (limitSeconds <= 0) {
            return false;
        }
        int usedBefore = usage.getUsedSeconds();
        int elapsed = (int) Math.max(0, Duration.between(usage.getStartedAt(), Instant.now()).getSeconds());
        int usedAfter = usedBefore + elapsed;
        if (usedAfter >= limitSeconds) {
            usage.setUsedSeconds(limitSeconds);
            usage.setRunning(false);
            usage.setStartedAt(null);
            limitUsageRepository.save(usage);
            recordEvent(childId, type, "STOP", elapsed);
            notifyLimitExceeded(childId, type, labelOf(cl, type), usedBefore, usedAfter, limitSeconds);
            return true;
        }
        return false;
    }

    /** Уведомление родителю при пересечении дневного лимита (один раз за пересечение). */
    private void notifyLimitExceeded(Long childId, String type, String label, int usedBefore, int usedAfter, int limitSeconds) {
        if (limitSeconds > 0 && usedBefore < limitSeconds && usedAfter >= limitSeconds) {
            notificationService.create(childId, "LIMIT_" + type,
                    "Лимит «" + label + "» на сегодня исчерпан",
                    "Время на устройстве закончилось", "limit", childId);
        }
    }

    private void recordEvent(Long childId, String type, String action, int seconds) {
        LimitEvent event = new LimitEvent();
        event.setChild(childRepository.getReferenceById(childId));
        event.setLimitType(type);
        event.setAction(action);
        event.setSeconds(seconds);
        event.setCreatedAt(Instant.now());
        limitEventRepository.save(event);
    }

    // ---------- Родитель: заморозка, трекер, выдача карманных ----------

    @Transactional
    public void setFrozen(Long parentId, Long childId, String type, boolean frozen) {
        childRepository.findByIdAndParentId(childId, parentId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        ChildLimit cl = childLimitRepository.findById(childId).orElseGet(ChildLimit::new);
        String t = normalizeType(cl, type);
        LimitFreeze freeze = limitFreezeRepository.findByChildIdAndLimitType(childId, t)
                .orElseGet(() -> {
                    LimitFreeze f = new LimitFreeze();
                    f.setChild(childRepository.getReferenceById(childId));
                    f.setLimitType(t);
                    return f;
                });
        freeze.setFrozen(frozen);
        freeze.setUpdatedAt(Instant.now());
        limitFreezeRepository.save(freeze);
    }

    @Transactional(readOnly = true)
    public List<LimitEventDto> listEvents(Long parentId, Long childId) {
        childRepository.findByIdAndParentId(childId, parentId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        return limitEventRepository.findByChildIdOrderByCreatedAtDesc(childId)
                .stream().map(LimitEventDto::from).toList();
    }

    /** «Выдано»: родитель выдал карманные деньги — остаток недели обнуляется. */
    @Transactional
    public PocketState payOutPocket(Long parentId, Long childId) {
        childRepository.findByIdAndParentId(childId, parentId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        ChildLimit cl = childLimitRepository.findById(childId).orElseGet(ChildLimit::new);
        Instant now = Instant.now();
        LocalDate weekStart = weekStart(now);
        BigDecimal spent = pocketDisbursementRepository.findByChildIdAndWeekStart(childId, weekStart)
                .stream().map(PocketDisbursement::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal extended = pocketExtensionRepository.findByChildIdAndWeekStart(childId, weekStart)
                .map(PocketExtension::getAmount).orElse(BigDecimal.ZERO);
        BigDecimal available = BigDecimal.valueOf(cl.getPocketWeekly()).add(extended).subtract(spent);
        if (available.signum() > 0) {
            PocketDisbursement disbursement = new PocketDisbursement();
            disbursement.setChild(childRepository.getReferenceById(childId));
            disbursement.setAmount(available);
            disbursement.setWeekStart(weekStart);
            disbursement.setCreatedAt(now);
            pocketDisbursementRepository.save(disbursement);
        }
        notificationService.markDoneForChild("POCKET", childId);
        return new PocketState(cl.getPocketWeekly(), spent.add(available), BigDecimal.ZERO);
    }

    // ---------- Эффекты товаров ----------

    /**
     * Применение эффекта товара при подтверждении покупки:
     * LIMIT_ONCE — пополнение остатка на сегодня (может превысить лимит);
     * LIMIT_PERMANENT — увеличение базового лимита на будущие дни/недели.
     */
    @Transactional
    public void applyProductEffect(Long childId, Product product) {
        String effectType = product.getEffectType();
        if (effectType == null || "NONE".equals(effectType)) {
            return;
        }
        String limit = product.getEffectLimit();
        int value = product.getEffectValue();
        if (limit == null || value <= 0) {
            return;
        }

        if ("LIMIT_ONCE".equals(effectType)) {
            if ("POCKET".equals(limit)) {
                LocalDate weekStart = weekStart(Instant.now());
                PocketExtension ext = pocketExtensionRepository.findByChildIdAndWeekStart(childId, weekStart)
                        .orElseGet(() -> {
                            PocketExtension e = new PocketExtension();
                            e.setChild(childRepository.getReferenceById(childId));
                            e.setWeekStart(weekStart);
                            e.setAmount(BigDecimal.ZERO);
                            e.setCreatedAt(Instant.now());
                            return e;
                        });
                ext.setAmount(ext.getAmount().add(BigDecimal.valueOf(value)));
                pocketExtensionRepository.save(ext);
            } else {
                String t = normalizeStandardType(limit);
                LimitUsage usage = usageFor(childId, t, limitDay(Instant.now()));
                usage.setExtendedSeconds(usage.getExtendedSeconds() + value * 60);
                limitUsageRepository.save(usage);
            }
        } else if ("LIMIT_PERMANENT".equals(effectType)) {
            ChildLimit cl = childLimitRepository.findById(childId).orElseGet(ChildLimit::new);
            cl.setChildId(childId);
            if ("POCKET".equals(limit)) {
                cl.setPocketWeekly(cl.getPocketWeekly() + value);
            } else {
                String t = normalizeStandardType(limit);
                setBaseMinutes(cl, t, baseMinutes(cl, t) + value);
            }
            cl.setUpdatedAt(Instant.now());
            childLimitRepository.save(cl);
        }
    }

    // ---------- Карманные деньги ----------

    @Transactional
    public PocketRequestDto requestPocket(Long childId, PocketRequestCreateRequest request) {
        if (request.amount() == null || request.amount().signum() <= 0) {
            throw new BadRequestException("Сумма должна быть больше нуля");
        }
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        PocketRequest pocketRequest = new PocketRequest();
        pocketRequest.setChild(child);
        pocketRequest.setAmount(request.amount());
        pocketRequest.setStatus("PENDING");
        pocketRequest.setCreatedAt(Instant.now());
        PocketRequest saved = pocketRequestRepository.save(pocketRequest);
        notificationService.create(childId, "POCKET", "Просит карманные деньги",
                "Сумма: " + saved.getAmount(), "pocket", saved.getId());
        return PocketRequestDto.from(saved);
    }

    @Transactional(readOnly = true)
    public List<PocketRequestDto> listPocketRequests(Long parentId) {
        return pocketRequestRepository.findByChild_ParentIdOrderByCreatedAtDesc(parentId)
                .stream().map(PocketRequestDto::from).toList();
    }

    @Transactional
    public PocketRequestDto approvePocket(Long parentId, Long requestId) {
        PocketRequest pocketRequest = pocketRequestRepository.findByIdAndChild_ParentId(requestId, parentId)
                .orElseThrow(() -> new NotFoundException("Запрос не найден"));
        if (!"PENDING".equals(pocketRequest.getStatus())) {
            throw new BadRequestException("Запрос уже обработан");
        }
        notificationService.markDoneByRef("pocket", requestId);
        Long childId = pocketRequest.getChild().getId();
        Instant now = Instant.now();
        LocalDate weekStart = weekStart(now);
        ChildLimit cl = childLimitRepository.findById(childId).orElseGet(ChildLimit::new);
        BigDecimal spent = pocketDisbursementRepository.findByChildIdAndWeekStart(childId, weekStart)
                .stream().map(PocketDisbursement::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal extended = pocketExtensionRepository.findByChildIdAndWeekStart(childId, weekStart)
                .map(PocketExtension::getAmount).orElse(BigDecimal.ZERO);
        BigDecimal available = BigDecimal.valueOf(cl.getPocketWeekly()).add(extended).subtract(spent);
        if (pocketRequest.getAmount().compareTo(available) > 0) {
            throw new BadRequestException("Недостаточно недельного лимита карманных денег");
        }

        PocketDisbursement disbursement = new PocketDisbursement();
        disbursement.setChild(pocketRequest.getChild());
        disbursement.setAmount(pocketRequest.getAmount());
        disbursement.setWeekStart(weekStart);
        disbursement.setCreatedAt(now);
        pocketDisbursementRepository.save(disbursement);

        pocketRequest.setStatus("APPROVED");
        pocketRequest.setResolvedAt(now);
        return PocketRequestDto.from(pocketRequestRepository.save(pocketRequest));
    }

    @Transactional
    public PocketRequestDto rejectPocket(Long parentId, Long requestId) {
        PocketRequest pocketRequest = pocketRequestRepository.findByIdAndChild_ParentId(requestId, parentId)
                .orElseThrow(() -> new NotFoundException("Запрос не найден"));
        if (!"PENDING".equals(pocketRequest.getStatus())) {
            throw new BadRequestException("Запрос уже обработан");
        }
        notificationService.markDoneByRef("pocket", requestId);
        pocketRequest.setStatus("REJECTED");
        pocketRequest.setResolvedAt(Instant.now());
        return PocketRequestDto.from(pocketRequestRepository.save(pocketRequest));
    }
}