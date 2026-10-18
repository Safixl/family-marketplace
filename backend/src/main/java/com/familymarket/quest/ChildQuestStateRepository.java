package com.familymarket.quest;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChildQuestStateRepository extends JpaRepository<ChildQuestState, Long> {

    Optional<ChildQuestState> findByChildIdAndQuestId(Long childId, Long questId);

    List<ChildQuestState> findByChildId(Long childId);
}