package com.familymarket.quest;

import com.familymarket.common.CurrentUser;
import com.familymarket.dto.QuestDto;
import com.familymarket.dto.QuestSubmissionDto;
import com.familymarket.dto.QuestSubmitRequest;
import com.familymarket.dto.QuestUpsertRequest;
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
public class QuestController {

    private final QuestService questService;

    public QuestController(QuestService questService) {
        this.questService = questService;
    }

    // ---------- Родитель ----------

    @GetMapping("/api/parent/quests")
    public List<QuestDto> listParentQuests() {
        return questService.listForParent(CurrentUser.parentId());
    }

    @PostMapping("/api/parent/quests")
    public QuestDto createQuest(@RequestBody QuestUpsertRequest request) {
        return questService.create(CurrentUser.parentId(), request);
    }

    @PutMapping("/api/parent/quests/{id}")
    public QuestDto updateQuest(@PathVariable Long id, @RequestBody QuestUpsertRequest request) {
        return questService.update(CurrentUser.parentId(), id, request);
    }

    @DeleteMapping("/api/parent/quests/{id}")
    public void deleteQuest(@PathVariable Long id) {
        questService.delete(CurrentUser.parentId(), id);
    }

    /** Лента верификации: ?status=PENDING|APPROVED|REJECTED|ALL */
    @GetMapping("/api/parent/quest-submissions")
    public List<QuestSubmissionDto> listSubmissions(@RequestParam(required = false) String status) {
        return questService.listSubmissions(CurrentUser.parentId(), status);
    }

    @PostMapping("/api/parent/quest-submissions/{id}/approve")
    public QuestSubmissionDto approve(@PathVariable Long id) {
        return questService.approve(CurrentUser.parentId(), id);
    }

    @PostMapping("/api/parent/quest-submissions/{id}/reject")
    public QuestSubmissionDto reject(@PathVariable Long id) {
        return questService.reject(CurrentUser.parentId(), id);
    }

    // ---------- Ребёнок ----------

    @GetMapping("/api/child/quests")
    public List<QuestDto> listChildQuests() {
        return questService.listActiveForChild(CurrentUser.childId());
    }

    @PostMapping("/api/child/quests/{id}/accept")
    public void accept(@PathVariable Long id) {
        questService.accept(CurrentUser.childId(), id);
    }

    @PostMapping("/api/child/quests/{id}/submit")
    public QuestSubmissionDto submit(@PathVariable Long id, @RequestBody QuestSubmitRequest request) {
        return questService.submit(CurrentUser.childId(), id, request);
    }

    @GetMapping("/api/child/quest-submissions")
    public List<QuestSubmissionDto> mySubmissions() {
        return questService.mySubmissions(CurrentUser.childId());
    }
}
