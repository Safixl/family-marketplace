package com.familymarket.reading;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReadingSettingsRepository extends JpaRepository<ReadingSettings, Long> {

    Optional<ReadingSettings> findByChildId(Long childId);
}