package com.familymarket.reading;

import com.familymarket.achievement.AchievementService;
import com.familymarket.balance.BalanceService;
import com.familymarket.child.Child;
import com.familymarket.child.ChildRepository;
import com.familymarket.common.BadRequestException;
import com.familymarket.common.ConflictException;
import com.familymarket.common.NotFoundException;
import com.familymarket.daily.DailyService;
import com.familymarket.dto.BookmarkRequest;
import com.familymarket.dto.ChildBookDto;
import com.familymarket.dto.ChildReadingResponse;
import com.familymarket.dto.ReadingBookDto;
import com.familymarket.dto.ReadingBookUpsertRequest;
import com.familymarket.dto.ReadingLogCreateRequest;
import com.familymarket.dto.ReadingLogDto;
import com.familymarket.dto.ReadingRequestApproveRequest;
import com.familymarket.dto.ReadingRequestCreateRequest;
import com.familymarket.dto.ReadingRequestDto;
import com.familymarket.dto.ReadingSettingsDto;
import com.familymarket.dto.ReadingSettingsUpdateRequest;
import com.familymarket.dto.ReadingStatsDto;
import com.familymarket.store.Store;
import com.familymarket.store.StoreService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReadingService {

    private final ReadingBookRepository bookRepository;
    private final ReadingLogRepository logRepository;
    private final ReadingRequestRepository requestRepository;
    private final ReadingBookmarkRepository bookmarkRepository;
    private final ReadingPageMarkRepository pageMarkRepository;
    private final ReadingSettingsRepository settingsRepository;
    private final ChildRepository childRepository;
    private final StoreService storeService;
    private final com.familymarket.store.StoreRepository storeRepository;
    private final BalanceService balanceService;
    private final AchievementService achievementService;
    private final DailyService dailyService;

    public ReadingService(ReadingBookRepository bookRepository,
                          ReadingLogRepository logRepository,
                          ReadingRequestRepository requestRepository,
                          ReadingBookmarkRepository bookmarkRepository,
                          ReadingPageMarkRepository pageMarkRepository,
                          ReadingSettingsRepository settingsRepository,
                          ChildRepository childRepository,
                          StoreService storeService,
                          com.familymarket.store.StoreRepository storeRepository,
                          BalanceService balanceService,
                          AchievementService achievementService,
                          DailyService dailyService) {
        this.bookRepository = bookRepository;
        this.logRepository = logRepository;
        this.requestRepository = requestRepository;
        this.bookmarkRepository = bookmarkRepository;
        this.pageMarkRepository = pageMarkRepository;
        this.settingsRepository = settingsRepository;
        this.childRepository = childRepository;
        this.storeService = storeService;
        this.storeRepository = storeRepository;
        this.balanceService = balanceService;
        this.achievementService = achievementService;
        this.dailyService = dailyService;
    }

    // ---------- Каталог книг (родитель, личные книги ребёнка) ----------

    @Transactional(readOnly = true)
    public List<ReadingBookDto> listBooks(Long parentId, Long childId) {
        childRepository.findByIdAndParentId(childId, parentId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        return bookRepository.findByChildIdOrderByCreatedAtAsc(childId)
                .stream().map(ReadingBookDto::from).toList();
    }

    @Transactional
    public ReadingBookDto createBook(Long parentId, Long storeId, Long childId, ReadingBookUpsertRequest request) {
        Store store = storeService.getOwned(parentId, storeId);
        Child child = childRepository.findByIdAndParentId(childId, parentId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        ReadingBook book = new ReadingBook();
        book.setStore(store);
        book.setChild(child);
        book.setName(request.name().trim());
        book.setAuthor(trimToNull(request.author()));
        book.setSeries(trimToNull(request.series()));
        book.setGenre(trimToNull(request.genre()));
        book.setPages(request.pages() == null ? 0 : request.pages());
        book.setMultiplier(request.multiplier() == null ? BigDecimal.ONE : request.multiplier());
        book.setActive(request.active() == null || request.active());
        book.setCreatedAt(Instant.now());
        return ReadingBookDto.from(bookRepository.save(book));
    }

    @Transactional
    public ReadingBookDto updateBook(Long parentId, Long bookId, ReadingBookUpsertRequest request) {
        ReadingBook book = getOwnedBook(parentId, bookId);
        book.setName(request.name().trim());
        book.setAuthor(trimToNull(request.author()));
        book.setSeries(trimToNull(request.series()));
        book.setGenre(trimToNull(request.genre()));
        if (request.pages() != null) {
            book.setPages(request.pages());
        }
        if (request.multiplier() != null) {
            book.setMultiplier(request.multiplier());
        }
        if (request.active() != null) {
            book.setActive(request.active());
        }
        return ReadingBookDto.from(bookRepository.save(book));
    }

    @Transactional
    public void deleteBook(Long parentId, Long bookId) {
        bookRepository.delete(getOwnedBook(parentId, bookId));
    }

    // ---------- Отметки о прочитанном ----------

    /**
     * Родитель отмечает прочитанную книгу — сразу засчитывается и начисляются баллы.
     */
    @Transactional
    public ReadingLogDto markReadByParent(Long parentId, ReadingLogCreateRequest request) {
        ReadingBook book = getOwnedBook(parentId, request.bookId());
        Child child = childRepository.findByIdAndParentId(request.childId(), parentId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        if (logRepository.existsByChildIdAndBookIdAndStatus(child.getId(), book.getId(), "APPROVED")) {
            throw new ConflictException("Эта книга уже засчитана");
        }
        BigDecimal points = pointsFor(book);
        balanceService.credit(child.getId(), book.getStore().getId(), points);

        ReadingLog log = new ReadingLog();
        log.setChild(child);
        log.setBook(book);
        log.setPoints(points);
        log.setStatus("APPROVED");
        log.setReadAt(request.readAt() == null ? LocalDate.now() : request.readAt());
        log.setCreatedAt(Instant.now());
        return ReadingLogDto.from(logRepository.save(log));
    }

    /**
     * Ребёнок отметил «я прочитал» — создаётся запись PENDING, баллы ждут подтверждения родителя.
     */
    @Transactional
    public ReadingLogDto childMarkRead(Long childId, Long bookId) {
        ReadingBook book = bookRepository.findById(bookId)
                .orElseThrow(() -> new NotFoundException("Книга не найдена"));
        if (book.getChild() == null || !book.getChild().getId().equals(childId)) {
            throw new NotFoundException("Книга не найдена");
        }
        if (logRepository.existsByChildIdAndBookIdAndStatus(childId, bookId, "PENDING")
                || logRepository.existsByChildIdAndBookIdAndStatus(childId, bookId, "APPROVED")) {
            throw new ConflictException("Книга уже отмечена");
        }
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));

        // Кнопка «Прочитал»: сначала проставляем последнюю страницу книги,
        // затем отправляем запрос родителю на подтверждение.
        if (book.getPages() > 0) {
            Instant now = Instant.now();
            ReadingBookmark bookmark = bookmarkRepository.findByChildIdAndBookId(childId, bookId)
                    .orElseGet(() -> {
                        ReadingBookmark b = new ReadingBookmark();
                        b.setChild(book.getChild());
                        b.setBook(book);
                        return b;
                    });
            bookmark.setPage(book.getPages());
            bookmark.setUpdatedAt(now);
            bookmarkRepository.save(bookmark);

            ReadingPageMark mark = new ReadingPageMark();
            mark.setChild(book.getChild());
            mark.setBook(book);
            mark.setPage(book.getPages());
            mark.setDay(LocalDate.now());
            mark.setCreatedAt(now);
            pageMarkRepository.save(mark);

            dailyService.recordReading(childId, pagesToday(childId, LocalDate.now()));
        }

        ReadingLog log = new ReadingLog();
        log.setChild(child);
        log.setBook(book);
        log.setPoints(pointsFor(book));
        log.setStatus("PENDING");
        log.setReadAt(LocalDate.now());
        log.setCreatedAt(Instant.now());
        return ReadingLogDto.from(logRepository.save(log));
    }

    /**
     * Родитель подтверждает прочитанную книгу — начисляются баллы.
     */
    @Transactional
    public ReadingLogDto approveLog(Long parentId, Long logId) {
        ReadingLog log = getOwnedLog(parentId, logId);
        if ("APPROVED".equals(log.getStatus())) {
            throw new ConflictException("Книга уже подтверждена");
        }
        log.setStatus("APPROVED");
        logRepository.save(log);
        balanceService.credit(log.getChild().getId(), log.getBook().getStore().getId(), log.getPoints());
        achievementService.checkProgress(log.getChild().getId());
        return ReadingLogDto.from(log);
    }

    @Transactional
    public void rejectLog(Long parentId, Long logId) {
        ReadingLog log = getOwnedLog(parentId, logId);
        logRepository.delete(log);
    }

    // ---------- Заявки ребёнка на книги ----------

    @Transactional
    public ReadingRequestDto createRequest(Long childId, Long storeId, ReadingRequestCreateRequest request) {
        Store store = storeRepositoryForChild(childId, storeId);
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        ReadingRequest readingRequest = new ReadingRequest();
        readingRequest.setChild(child);
        readingRequest.setStore(store);
        readingRequest.setTitle(request.title().trim());
        readingRequest.setStatus("PENDING");
        readingRequest.setCreatedAt(Instant.now());
        return ReadingRequestDto.from(requestRepository.save(readingRequest));
    }

    @Transactional(readOnly = true)
    public List<ReadingRequestDto> listRequests(Long parentId, Long childId) {
        childRepository.findByIdAndParentId(childId, parentId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        return requestRepository.findByChildIdOrderByCreatedAtDesc(childId)
                .stream().map(ReadingRequestDto::from).toList();
    }

    /**
     * Родитель принимает заявку: создаёт полноценную книгу для ребёнка.
     */
    @Transactional
    public ReadingBookDto approveRequest(Long parentId, Long requestId, ReadingRequestApproveRequest request) {
        ReadingRequest readingRequest = getOwnedRequest(parentId, requestId);
        if (!"PENDING".equals(readingRequest.getStatus())) {
            throw new ConflictException("Заявка уже обработана");
        }
        readingRequest.setStatus("APPROVED");
        readingRequest.setResolvedAt(Instant.now());
        requestRepository.save(readingRequest);

        ReadingBook book = new ReadingBook();
        book.setStore(readingRequest.getStore());
        book.setChild(readingRequest.getChild());
        book.setName(request.name().trim());
        book.setAuthor(trimToNull(request.author()));
        book.setSeries(trimToNull(request.series()));
        book.setGenre(trimToNull(request.genre()));
        book.setPages(request.pages() == null ? 0 : request.pages());
        book.setMultiplier(request.multiplier() == null ? BigDecimal.ONE : request.multiplier());
        book.setActive(true);
        book.setCreatedAt(Instant.now());
        return ReadingBookDto.from(bookRepository.save(book));
    }

    @Transactional
    public void rejectRequest(Long parentId, Long requestId) {
        ReadingRequest readingRequest = getOwnedRequest(parentId, requestId);
        if (!"PENDING".equals(readingRequest.getStatus())) {
            throw new ConflictException("Заявка уже обработана");
        }
        readingRequest.setStatus("REJECTED");
        readingRequest.setResolvedAt(Instant.now());
        requestRepository.save(readingRequest);
    }

    // ---------- Статистика ----------

    @Transactional(readOnly = true)
    public ReadingStatsDto statsForChild(Long parentId, Long childId) {
        childRepository.findByIdAndParentId(childId, parentId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        return buildStats(childId);
    }

    @Transactional(readOnly = true)
    public ChildReadingResponse childReading(Long childId) {
        List<ChildBookDto> books = bookRepository.findByChildIdAndActiveTrueOrderByCreatedAtAsc(childId)
                .stream().map(this::toChildBook).toList();
        List<ReadingRequestDto> requests = requestRepository.findByChildIdOrderByCreatedAtDesc(childId)
                .stream().map(ReadingRequestDto::from).toList();
        Map<Long, Integer> bookmarks = new LinkedHashMap<>();
        bookmarkRepository.findByChildId(childId)
                .forEach(b -> bookmarks.put(b.getBook().getId(), b.getPage()));
        ReadingSettings settings = settingsRepository.findByChildId(childId).orElse(null);
        int pagesTarget = settings == null ? 20 : settings.getPagesTarget();
        return new ChildReadingResponse(books, requests, buildStats(childId), bookmarks,
                pagesToday(childId, LocalDate.now()), pagesTarget);
    }

    // ---------- Закладки страниц и дейлик чтения ----------

    /**
     * Ребёнок отмечает текущую страницу книги. Разница между отметками за день
     * засчитывается в дейлик чтения (пример: 113 → 213 = +100 страниц).
     */
    @Transactional
    public void bookmark(Long childId, Long bookId, BookmarkRequest request) {
        ReadingBook book = bookRepository.findById(bookId)
                .orElseThrow(() -> new NotFoundException("Книга не найдена"));
        if (book.getChild() == null || !book.getChild().getId().equals(childId)) {
            throw new NotFoundException("Книга не найдена");
        }
        int page = request.page();
        if (book.getPages() > 0 && page > book.getPages()) {
            page = book.getPages();
        }
        Instant now = Instant.now();
        ReadingBookmark bookmark = bookmarkRepository.findByChildIdAndBookId(childId, bookId)
                .orElseGet(() -> {
                    ReadingBookmark b = new ReadingBookmark();
                    b.setChild(book.getChild());
                    b.setBook(book);
                    return b;
                });
        bookmark.setPage(page);
        bookmark.setUpdatedAt(now);
        bookmarkRepository.save(bookmark);

        ReadingPageMark mark = new ReadingPageMark();
        mark.setChild(book.getChild());
        mark.setBook(book);
        mark.setPage(page);
        mark.setDay(LocalDate.now());
        mark.setCreatedAt(now);
        pageMarkRepository.save(mark);

        dailyService.recordReading(childId, pagesToday(childId, LocalDate.now()));
    }

    /** Сумма дельт отметок страниц за день (дейлик чтения). */
    @Transactional(readOnly = true)
    public int pagesToday(Long childId, LocalDate day) {
        List<ReadingPageMark> marks = pageMarkRepository.findByChildIdAndDayOrderByCreatedAtAsc(childId, day);
        if (marks.isEmpty()) {
            return 0;
        }
        // последняя отметка предыдущего дня по каждой книге — база для первой дельты
        Map<Long, Integer> prevByBook = new LinkedHashMap<>();
        pageMarkRepository.findByChildIdAndDayBeforeOrderByCreatedAtDesc(childId, day)
                .forEach(m -> prevByBook.putIfAbsent(m.getBook().getId(), m.getPage()));

        int total = 0;
        Map<Long, Integer> lastByBook = new LinkedHashMap<>();
        for (ReadingPageMark mark : marks) {
            Integer prev = lastByBook.get(mark.getBook().getId());
            if (prev == null) {
                prev = prevByBook.getOrDefault(mark.getBook().getId(), 0);
            }
            int delta = mark.getPage() - prev;
            if (delta > 0) {
                total += delta;
            }
            lastByBook.put(mark.getBook().getId(), mark.getPage());
        }
        return total;
    }

    // ---------- Настройки дейлика чтения (родитель) ----------

    @Transactional(readOnly = true)
    public ReadingSettingsDto getSettings(Long parentId, Long childId) {
        childRepository.findByIdAndParentId(childId, parentId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        ReadingSettings settings = settingsRepository.findByChildId(childId).orElse(null);
        if (settings == null) {
            return new ReadingSettingsDto(childId, null, 20, BigDecimal.ZERO, 0);
        }
        return new ReadingSettingsDto(childId, settings.getStore().getId(), settings.getPagesTarget(),
                settings.getRewardAmount(), settings.getXpReward());
    }

    @Transactional
    public ReadingSettingsDto updateSettings(Long parentId, Long childId, ReadingSettingsUpdateRequest request) {
        childRepository.findByIdAndParentId(childId, parentId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        Store store = storeRepository.findByParentIdAndTemplateType(parentId, "READING")
                .orElseThrow(() -> new BadRequestException("Магазин чтения не настроен"));
        ReadingSettings settings = settingsRepository.findByChildId(childId).orElseGet(() -> {
            ReadingSettings s = new ReadingSettings();
            s.setChildId(childId);
            s.setStore(store);
            return s;
        });
        if (request.pagesTarget() != null) {
            settings.setPagesTarget(request.pagesTarget());
        }
        if (request.rewardAmount() != null) {
            settings.setRewardAmount(request.rewardAmount());
        }
        if (request.xpReward() != null) {
            settings.setXpReward(request.xpReward());
        }
        settings.setUpdatedAt(Instant.now());
        settingsRepository.save(settings);
        return getSettings(parentId, childId);
    }

    private ChildBookDto toChildBook(ReadingBook book) {
        String status = null;
        if (logRepository.existsByChildIdAndBookIdAndStatus(book.getChild().getId(), book.getId(), "APPROVED")) {
            status = "APPROVED";
        } else if (logRepository.existsByChildIdAndBookIdAndStatus(book.getChild().getId(), book.getId(), "PENDING")) {
            status = "PENDING";
        }
        Integer currentPage = bookmarkRepository.findByChildIdAndBookId(book.getChild().getId(), book.getId())
                .map(ReadingBookmark::getPage).orElse(null);
        return new ChildBookDto(book.getId(), book.getName(), book.getAuthor(), book.getSeries(),
                book.getGenre(), book.getPages(), book.getMultiplier(), status, currentPage);
    }

    private ReadingStatsDto buildStats(Long childId) {
        List<ReadingLogDto> logs = logRepository.findByChildIdOrderByReadAtDesc(childId)
                .stream().map(ReadingLogDto::from).toList();
        long pendingCount = logRepository.findByChildIdAndStatusOrderByReadAtDesc(childId, "PENDING").size();
        BigDecimal pendingPoints = logRepository.findByChildIdAndStatusOrderByReadAtDesc(childId, "PENDING")
                .stream().map(ReadingLog::getPoints).reduce(BigDecimal.ZERO, BigDecimal::add);
        return new ReadingStatsDto(
                logRepository.countApprovedByChildId(childId),
                logRepository.sumPagesByChildId(childId),
                logRepository.sumPointsByChildId(childId),
                pendingCount,
                pendingPoints,
                logs);
    }

    private ReadingBook getOwnedBook(Long parentId, Long bookId) {
        return bookRepository.findByIdAndStore_ParentId(bookId, parentId)
                .orElseThrow(() -> new NotFoundException("Книга не найдена"));
    }

    private ReadingLog getOwnedLog(Long parentId, Long logId) {
        return logRepository.findByIdAndChild_ParentId(logId, parentId)
                .orElseThrow(() -> new NotFoundException("Запись о прочитанном не найдена"));
    }

    private ReadingRequest getOwnedRequest(Long parentId, Long requestId) {
        return requestRepository.findByIdAndChild_ParentId(requestId, parentId)
                .orElseThrow(() -> new NotFoundException("Заявка не найдена"));
    }

    private Store storeRepositoryForChild(Long childId, Long storeId) {
        Long parentId = childRepository.findParentIdById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        return storeService.getOwned(parentId, storeId);
    }

    private BigDecimal pointsFor(ReadingBook book) {
        return BigDecimal.valueOf(book.getPages())
                .multiply(book.getMultiplier())
                .setScale(2, RoundingMode.HALF_UP);
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}