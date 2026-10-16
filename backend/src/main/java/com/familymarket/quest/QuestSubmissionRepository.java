package com.familymarket.quest;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QuestSubmissionRepository extends JpaRepository<QuestSubmission, Long> {

    List<QuestSubmission> findByChildIdOrderByCreatedAtDesc(Long childId);

    @Query("select s from QuestSubmission s where s.quest.parent.id = :parentId " +
            "and s.status = :status order by s.createdAt desc")
    List<QuestSubmission> findByParentIdAndStatus(@Param("parentId") Long parentId, @Param("status") String status);

    @Query("select s from QuestSubmission s where s.quest.parent.id = :parentId " +
            "order by s.createdAt desc")
    List<QuestSubmission> findByParentId(@Param("parentId") Long parentId);

    boolean existsByQuestIdAndChildIdAndStatus(Long questId, Long childId, String status);

    @Query("select coalesce(sum(q.xpReward), 0) from QuestSubmission s join s.quest q " +
            "where s.child.id = :childId and s.status = 'APPROVED'")
    long sumXpByChildId(@Param("childId") Long childId);
}
