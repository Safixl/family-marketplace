package com.familymarket.reading;

import com.familymarket.common.CurrentUser;
import com.familymarket.dto.BookmarkRequest;
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
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ReadingController {

    private final ReadingService readingService;

    public ReadingController(ReadingService readingService) {
        this.readingService = readingService;
    }

    // ---------- Книги (родитель, личные для ребёнка) ----------

    @GetMapping("/api/parent/children/{childId}/books")
    public List<ReadingBookDto> listBooks(@PathVariable Long childId) {
        return readingService.listBooks(CurrentUser.parentId(), childId);
    }

    @PostMapping("/api/parent/stores/{storeId}/children/{childId}/books")
    @ResponseStatus(HttpStatus.CREATED)
    public ReadingBookDto createBook(@PathVariable Long storeId, @PathVariable Long childId,
                                     @Valid @RequestBody ReadingBookUpsertRequest request) {
        return readingService.createBook(CurrentUser.parentId(), storeId, childId, request);
    }

    @PutMapping("/api/parent/books/{id}")
    public ReadingBookDto updateBook(@PathVariable Long id, @Valid @RequestBody ReadingBookUpsertRequest request) {
        return readingService.updateBook(CurrentUser.parentId(), id, request);
    }

    @DeleteMapping("/api/parent/books/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBook(@PathVariable Long id) {
        readingService.deleteBook(CurrentUser.parentId(), id);
    }

    // ---------- Отметки и статистика (родитель) ----------

    @PostMapping("/api/parent/reading-logs")
    @ResponseStatus(HttpStatus.CREATED)
    public ReadingLogDto markRead(@Valid @RequestBody ReadingLogCreateRequest request) {
        return readingService.markReadByParent(CurrentUser.parentId(), request);
    }

    @PostMapping("/api/parent/reading-logs/{id}/approve")
    public ReadingLogDto approveLog(@PathVariable Long id) {
        return readingService.approveLog(CurrentUser.parentId(), id);
    }

    @PostMapping("/api/parent/reading-logs/{id}/reject")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void rejectLog(@PathVariable Long id) {
        readingService.rejectLog(CurrentUser.parentId(), id);
    }

    @GetMapping("/api/parent/children/{childId}/reading")
    public ReadingStatsDto childReading(@PathVariable Long childId) {
        return readingService.statsForChild(CurrentUser.parentId(), childId);
    }

    // ---------- Настройки дейлика чтения (родитель) ----------

    @GetMapping("/api/parent/children/{childId}/reading-settings")
    public ReadingSettingsDto getReadingSettings(@PathVariable Long childId) {
        return readingService.getSettings(CurrentUser.parentId(), childId);
    }

    @PutMapping("/api/parent/children/{childId}/reading-settings")
    public ReadingSettingsDto updateReadingSettings(@PathVariable Long childId,
                                                    @Valid @RequestBody ReadingSettingsUpdateRequest request) {
        return readingService.updateSettings(CurrentUser.parentId(), childId, request);
    }

    // ---------- Заявки ребёнка (родитель) ----------

    @GetMapping("/api/parent/children/{childId}/reading-requests")
    public List<ReadingRequestDto> listRequests(@PathVariable Long childId) {
        return readingService.listRequests(CurrentUser.parentId(), childId);
    }

    @PostMapping("/api/parent/reading-requests/{id}/approve")
    public ReadingBookDto approveRequest(@PathVariable Long id,
                                         @Valid @RequestBody ReadingRequestApproveRequest request) {
        return readingService.approveRequest(CurrentUser.parentId(), id, request);
    }

    @PostMapping("/api/parent/reading-requests/{id}/reject")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void rejectRequest(@PathVariable Long id) {
        readingService.rejectRequest(CurrentUser.parentId(), id);
    }

    // ---------- Ребенок ----------

    @GetMapping("/api/child/reading")
    public ChildReadingResponse childReading() {
        return readingService.childReading(CurrentUser.childId());
    }

    @PostMapping("/api/child/books/{id}/read")
    @ResponseStatus(HttpStatus.CREATED)
    public ReadingLogDto childMarkRead(@PathVariable Long id) {
        return readingService.childMarkRead(CurrentUser.childId(), id);
    }

    @PostMapping("/api/child/books/{id}/bookmark")
    public void bookmark(@PathVariable Long id, @Valid @RequestBody BookmarkRequest request) {
        readingService.bookmark(CurrentUser.childId(), id, request);
    }

    @PostMapping("/api/child/stores/{storeId}/reading-requests")
    @ResponseStatus(HttpStatus.CREATED)
    public ReadingRequestDto createRequest(@PathVariable Long storeId,
                                           @Valid @RequestBody ReadingRequestCreateRequest request) {
        return readingService.createRequest(CurrentUser.childId(), storeId, request);
    }
}