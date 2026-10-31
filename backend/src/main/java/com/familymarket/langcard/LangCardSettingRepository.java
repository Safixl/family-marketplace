package com.familymarket.langcard;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LangCardSettingRepository extends JpaRepository<LangCardSetting, Long> {

    List<LangCardSetting> findByParentId(Long parentId);

    Optional<LangCardSetting> findByParentIdAndTaskType(Long parentId, LangTaskType taskType);
}
