package com.familymarket.reading;

import com.familymarket.achievement.AchievementService;
import com.familymarket.balance.BalanceService;
import com.familymarket.child.Child;
import com.familymarket.child.ChildRepository;
import com.familymarket.common.BadRequestException;
import com.familymarket.common.ConflictException;
import com.familymarket.common.NotFoundException;
import com.familymarket.dto.ChildBookDto;
import com.familymarket.dto.ChildReadingResponse;
import com.familymarket.dto.ReadingBookDto;
import com.familymarket.dto.ReadingBookUpsertRequest;
import com.familymarket.dto.ReadingLogCreateRequest;
import com.familymarket.dto.ReadingLogDto;
import com.familymarket.dto.ReadingRequestApproveRequest;
import com.familymarket.dto.ReadingRequestCreateRequest;
import com.familymarket.dto.ReadingRequestDto;
import com.familymarket.dto.ReadingStatsDto;
import com.familymarket.store.Store;
import com.familymarket.store.StoreService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Service
public class ReadingService {

    private final ReadingBookRepository bookRepository;
    private final ReadingLogRepository logRepository;
    private final ReadingRequestRepository requestRepository;
    private final ChildRepository childRepository;
    private final StoreService storeService;
    private final BalanceService balanceService;
    private final AchievementService achievementService;

    public ReadingService(ReadingBookRepository bookRepository,
                          ReadingLogRepository logRepository,
                          ReadingRequestRepository requestRepository,
                          ChildRepository childRepository,
                          StoreService storeService,
                          BalanceService balanceService,
                          AchievementService achievementService) {
        this.bookRepository = bookRepository;
        this.logRepository = logRepository;
        this.requestRepository = requestRepository;
        this.childRepository = childRepository;
        this.storeService = storeService;
        this.balanceService = balanceService;
        this.achievementService = achievementService;
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
        return new ChildReadingResponse(books, requests, buildStats(childId));
    }

    private ChildBookDto toChildBook(ReadingBook book) {
        String status = null;
        if (logRepository.existsByChildIdAndBookIdAndStatus(book.getChild().getId(), book.getId(), "APPROVED")) {
            status = "APPROVED";
        } else if (logRepository.existsByChildIdAndBookIdAndStatus(book.getChild().getId(), book.getId(), "PENDING")) {
            status = "PENDING";
        }
        return new ChildBookDto(book.getId(), book.getName(), book.getAuthor(), book.getSeries(),
                book.getGenre(), book.getPages(), book.getMultiplier(), status);
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