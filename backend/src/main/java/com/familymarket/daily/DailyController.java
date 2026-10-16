package com.familymarket.daily;

import com.familymarket.common.CurrentUser;
import com.familymarket.dto.DailyAnswerRequest;
import com.familymarket.dto.DailySkillDto;
import com.familymarket.dto.DailyStateDto;
import com.familymarket.dto.LangLearnRequest;
import com.familymarket.dto.SportLogRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DailyController {

    private final DailyService dailyService;

    public DailyController(DailyService dailyService) {
        this.dailyService = dailyService;
    }

    /** Ежедневные дейлики ребёнка (состояние на сегодня). */
    @GetMapping("/api/child/dailies")
    public DailyStateDto state() {
        return dailyService.state(CurrentUser.childId());
    }

    /** Ответ на задание логики. */
    @PostMapping("/api/child/dailies/logic/answer")
    public DailySkillDto answerLogic(@RequestBody DailyAnswerRequest request) {
        return dailyService.answerLogic(CurrentUser.childId(), request);
    }

    /** Ответ на пример математики. */
    @PostMapping("/api/child/dailies/math/answer")
    public DailySkillDto answerMath(@RequestBody DailyAnswerRequest request) {
        return dailyService.answerMath(CurrentUser.childId(), request);
    }

    /** Выученные слова (карточки). */
    @PostMapping("/api/child/dailies/lang/learn")
    public DailySkillDto learnLang(@RequestBody LangLearnRequest request) {
        return dailyService.learnLang(CurrentUser.childId(), request);
    }

    /** Минуты активности и шаги. */
    @PostMapping("/api/child/dailies/sport/log")
    public DailySkillDto logSport(@RequestBody SportLogRequest request) {
        return dailyService.logSport(CurrentUser.childId(), request);
    }
}
