package com.familymarket.house;

import com.familymarket.child.Child;
import com.familymarket.child.ChildRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Начисление «румов» за хозяйственность строго 1-го числа в 00:05 по Москве.
 * <p>
 * Баллы за порядок в комнате и помощь по дому копятся в календаре как «ожидающие»
 * и не попадают в баланс раньше срока. Ленивое начисление в
 * {@link HouseService#settlePending(Long)} остаётся страховкой на случай,
 * если приложение было выключено в момент запуска планировщика.
 */
@Component
public class HouseSettlementScheduler {

    private static final Logger log = LoggerFactory.getLogger(HouseSettlementScheduler.class);

    private final ChildRepository childRepository;
    private final HouseService houseService;

    public HouseSettlementScheduler(ChildRepository childRepository, HouseService houseService) {
        this.childRepository = childRepository;
        this.houseService = houseService;
    }

    /** Первое число каждого месяца в 00:05 по Москве. */
    @Scheduled(cron = "0 5 0 1 * *", zone = "Europe/Moscow")
    public void settlePreviousMonth() {
        for (Child child : childRepository.findAll()) {
            try {
                houseService.settlePending(child.getId());
            } catch (RuntimeException e) {
                // Один ребёнок не должен блокировать начисление остальным.
                log.warn("Не удалось начислить баллы хозяйственности ребёнку {}", child.getId(), e);
            }
        }
    }
}
