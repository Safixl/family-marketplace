package com.familymarket.audit;

import com.familymarket.user.User;
import com.familymarket.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Журнал аудита ключевых действий родителя.
 * Записывается в отдельной транзакции (REQUIRES_NEW), чтобы фиксировать действие
 * даже при откате основной транзакции. Ошибки аудита не влияют на основной сценарий.
 */
@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AuditService(AuditLogRepository auditLogRepository, UserRepository userRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(Long parentId, String action, String entity, String details) {
        try {
            User parent = userRepository.findById(parentId)
                    .orElseThrow(() -> new com.familymarket.common.NotFoundException("Пользователь не найден"));
            AuditLog log = new AuditLog();
            log.setParent(parent);
            log.setAction(action);
            log.setEntity(entity);
            log.setDetails(details);
            log.setCreatedAt(java.time.Instant.now());
            auditLogRepository.save(log);
        } catch (Exception ignored) {
            // аудит не должен ломать основной сценарий
        }
    }
}
