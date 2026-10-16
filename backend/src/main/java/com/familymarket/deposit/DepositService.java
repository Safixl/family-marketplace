package com.familymarket.deposit;

import com.familymarket.balance.BalanceRepository;
import com.familymarket.balance.BalanceService;
import com.familymarket.child.Child;
import com.familymarket.child.ChildRepository;
import com.familymarket.common.BadRequestException;
import com.familymarket.common.NotFoundException;
import com.familymarket.dto.DepositDto;
import com.familymarket.dto.DepositRequest;
import com.familymarket.store.Store;
import com.familymarket.store.StoreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.List;

/**
 * «Личный инвест-фонд»: часть баллов магазина кладётся на депозит под процент
 * (rate = 5-10% в неделю). Проценты капитализируются раз в неделю (начисляются лениво).
 */
@Service
public class DepositService {

    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);

    private final DepositRepository depositRepository;
    private final ChildRepository childRepository;
    private final StoreRepository storeRepository;
    private final BalanceRepository balanceRepository;
    private final BalanceService balanceService;

    public DepositService(DepositRepository depositRepository,
                          ChildRepository childRepository,
                          StoreRepository storeRepository,
                          BalanceRepository balanceRepository,
                          BalanceService balanceService) {
        this.depositRepository = depositRepository;
        this.childRepository = childRepository;
        this.storeRepository = storeRepository;
        this.balanceRepository = balanceRepository;
        this.balanceService = balanceService;
    }

    /** Список депозитов ребёнка с начислением накопленных процентов. */
    @Transactional
    public List<DepositDto> listForChild(Long childId) {
        List<Deposit> deposits = depositRepository.findByChildIdOrderByCreatedAtAsc(childId);
        deposits.forEach(this::accrueInterest);
        return deposits.stream().map(DepositDto::from).toList();
    }

    /** Вклад: переводим валюту с баланса магазина на депозит. */
    @Transactional
    public DepositDto deposit(Long childId, DepositRequest request) {
        if (request.amount() == null || request.amount().signum() <= 0) {
            throw new BadRequestException("Сумма вклада должна быть положительной");
        }
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new NotFoundException("Ребенок не найден"));
        Store store = storeRepository.findById(request.storeId())
                .orElseThrow(() -> new NotFoundException("Магазин не найден"));
        if (!store.getParent().getId().equals(child.getParent().getId())) {
            throw new NotFoundException("Магазин не найден");
        }

        // Проверяем, что на балансе хватает средств
        BigDecimal available = balanceRepository.findByChildIdAndStoreId(request.storeId(), childId)
                .map(b -> b.getAmount())
                .orElse(BigDecimal.ZERO);
        if (available.compareTo(request.amount()) < 0) {
            throw new BadRequestException("Недостаточно баллов на балансе магазина");
        }

        balanceService.credit(childId, store.getId(), request.amount().negate());

        Deposit deposit = depositRepository.findByChildIdAndStoreId(childId, store.getId())
                .orElseGet(() -> {
                    Deposit created = new Deposit();
                    created.setChild(child);
                    created.setStore(store);
                    created.setAmount(BigDecimal.ZERO);
                    created.setRate(request.rate() == null ? BigDecimal.valueOf(5) : request.rate());
                    created.setLastInterestAt(Instant.now());
                    created.setCreatedAt(Instant.now());
                    return created;
                });
        accrueInterest(deposit);
        deposit.setAmount(deposit.getAmount().add(request.amount()));
        return DepositDto.from(depositRepository.save(deposit));
    }

    /** Снятие: возвращаем валюту с депозита на баланс магазина. */
    @Transactional
    public DepositDto withdraw(Long childId, DepositRequest request) {
        if (request.amount() == null || request.amount().signum() <= 0) {
            throw new BadRequestException("Сумма снятия должна быть положительной");
        }
        Deposit deposit = depositRepository.findByChildIdAndStoreId(childId, request.storeId())
                .orElseThrow(() -> new NotFoundException("Депозит не найден"));
        accrueInterest(deposit);
        if (deposit.getAmount().compareTo(request.amount()) < 0) {
            throw new BadRequestException("Недостаточно средств на депозите");
        }
        deposit.setAmount(deposit.getAmount().subtract(request.amount()));
        depositRepository.save(deposit);
        balanceService.credit(childId, deposit.getStore().getId(), request.amount());
        return DepositDto.from(deposit);
    }

    /** Начисление процентов за полные прошедшие недели (капитализация). */
    private void accrueInterest(Deposit deposit) {
        Instant now = Instant.now();
        if (deposit.getLastInterestAt().isAfter(now)) {
            return;
        }
        long weeks = Duration.between(deposit.getLastInterestAt(), now).toDays() / 7;
        if (weeks <= 0 || deposit.getAmount().signum() <= 0) {
            return;
        }
        BigDecimal rate = deposit.getRate();
        for (int i = 0; i < weeks; i++) {
            BigDecimal interest = deposit.getAmount()
                    .multiply(rate)
                    .divide(HUNDRED, 2, RoundingMode.HALF_UP);
            deposit.setAmount(deposit.getAmount().add(interest));
        }
        // Сдвигаем точку начисления вперёд на полные недели
        deposit.setLastInterestAt(deposit.getLastInterestAt().plus(Duration.ofDays(weeks * 7)));
        depositRepository.save(deposit);
    }
}
