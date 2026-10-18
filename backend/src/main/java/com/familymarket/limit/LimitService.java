package com.familymarket.limit;

import com.familymarket.child.Child;
import com.familymarket.child.ChildRepository;
import com.familymarket.common.BadRequestException;
import com.familymarket.common.NotFoundException;
import com.familymarket.dto.ChildLimitsDto;
import com.familymarket.dto.ChildLimitsUpdateRequest;
import com.familymarket.dto.LimitStateDto;
import com.familymarket.dto.LimitTypeState;
import com.familymarket.dto.PocketRequestCreateRequest;
import com.familymarket.dto.PocketRequestDto;
import com.familymarket.dto.PocketState;
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
import java.util.List;

@Service
public class LimitService {

    private static final ZoneId ZONE = ZoneId.of("Europe/Moscow");
    private static final List<String> TIME_LIMIT_TYPES = List.of("TV", "PC", "CONSOLE", "PHONE", "TABLET");

    private final ChildLimitRepository childLimitRepository;
    private final LimitUsageRepository limitUsageRepository;
    private final PocketRequestRepository pocketRequestRepository;
    private final PocketDisbursementRepository pocketDisbursementRepository;
    private final PocketExtensionRepository pocketExtensionRepository;
    private final ChildRepository childRepository;

    public LimitService(ChildLimitRepository childLimitRepository,
                        LimitUsageRepository limitUsageRepository,
                        PocketRequestRepository pocketRequestRepository,
                        PocketDisbursementRepository pocketDisbursementRepository,
                        PocketExtensionRepository pocketExtensionRepository,
                        ChildRepository childRepository) {
        this.childLimitRepository = childLimitRepository;
        this.limitUsageRepository = limitUsageRepository;
        this.pocketRequestRepository = pocketRequestRepository;
        this.pocketDisbursementRepository = pocketDisbursementRepository;
        this.pocketExtensionRepository = pocketExtensionRepository;
        this.childRepository = childRepository;
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

    private int baseMinutes(ChildLimit cl, String type) {
        return switch (type) {
            case "TV" -> cl.getTvMinutes();
            case "PC" -> cl.getPcMinutes();
            case "CONSOLE" -> cl.getConsoleMinutes();
            case "PHONE" -> cl.getPhoneMinutes();
            case "TABLET" -> cl.getTabletMinutes();
            default -> 0;
        };
    }

    private void setBaseMinutes(ChildLimit cl, String type, int value) {
        switch (type) {
            case "TV" -> cl.setTvMinutes(value);
            case "PC" -> cl.setPcMinutes(value);
            case "CONSOLE" -> cl.setConsoleMinutes(value);
            case "PHONE" -> cl.setPhoneMinutes(value);
            case "TABLET" -> cl.setTabletMinutes(value);
            default -> throw new BadRequestException("Неизвестный тип лимита: " + type);
        }
    }

    private String normalizeType(String type) {
        String t = type.trim().toUpperCase();
        if (!TIME_LIMIT_TYPES.contains(t)) {
            throw new BadRequestException("Неизвестный тип лимита: " + type);
        }
        return t;
    }

    // ---------- Родитель ----------

    @Transactional(readOnly = true)
    public ChildLimitsDto getChildLimits(Long parentId, Long childId) {
        childRepository.findByIdAndParentId(childId, parentId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        ChildLimit cl = childLimitRepository.findById(childId).orElseGet(ChildLimit::new);
        return new ChildLimitsDto(childId, cl.getTvMinutes(), cl.getPcMinutes(), cl.getConsoleMinutes(),
                cl.getPhoneMinutes(), cl.getTabletMinutes(), cl.getPocketWeekly());
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
        cl.setUpdatedAt(Instant.now());
        childLimitRepository.save(cl);
        return getChildLimits(parentId, childId);
    }

    // ---------- Ребенок ----------

    @Transactional(readOnly = true)
    public LimitStateDto getState(Long childId) {
        ChildLimit cl = childLimitRepository.findById(childId).orElseGet(ChildLimit::new);
        Instant now = Instant.now();
        LocalDate day = limitDay(now);
        List<LimitTypeState> limits = new ArrayList<>();
        for (String type : TIME_LIMIT_TYPES) {
            LimitUsage usage = usageFor(childId, type, day);
            int used = usage.getUsedSeconds();
            if (usage.isRunning() && usage.getStartedAt() != null) {
                used += (int) Math.max(0, Duration.between(usage.getStartedAt(), now).getSeconds());
            }
            int remaining = Math.max(0, baseMinutes(cl, type) * 60 + usage.getExtendedSeconds() - used);
            limits.add(new LimitTypeState(type, baseMinutes(cl, type), used, usage.getExtendedSeconds(), remaining, usage.isRunning()));
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
        String t = normalizeType(type);
        LimitUsage usage = usageFor(childId, t, limitDay(Instant.now()));
        if (!usage.isRunning()) {
            usage.setRunning(true);
            usage.setStartedAt(Instant.now());
            limitUsageRepository.save(usage);
        }
    }

    @Transactional
    public void stopTimer(Long childId, String type) {
        String t = normalizeType(type);
        LimitUsage usage = usageFor(childId, t, limitDay(Instant.now()));
        if (usage.isRunning() && usage.getStartedAt() != null) {
            usage.setUsedSeconds(usage.getUsedSeconds()
                    + (int) Math.max(0, Duration.between(usage.getStartedAt(), Instant.now()).getSeconds()));
            usage.setRunning(false);
            usage.setStartedAt(null);
            limitUsageRepository.save(usage);
        }
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
                String t = normalizeType(limit);
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
                String t = normalizeType(limit);
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
        return PocketRequestDto.from(pocketRequestRepository.save(pocketRequest));
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
        pocketRequest.setStatus("REJECTED");
        pocketRequest.setResolvedAt(Instant.now());
        return PocketRequestDto.from(pocketRequestRepository.save(pocketRequest));
    }
}