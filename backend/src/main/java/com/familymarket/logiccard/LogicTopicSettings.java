package com.familymarket.logiccard;

import com.familymarket.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/** Настройки темы логики для родителя: тумблер Active + базовая сложность (потолок «Сложный»). */
@Entity
@Table(name = "logic_topic_settings")
@Getter
@Setter
public class LogicTopicSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "parent_id", nullable = false)
    private User parent;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "topic_id", nullable = false)
    private LogicTopic topic;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "base_difficulty", nullable = false, length = 16)
    private String baseDifficulty = "MEDIUM";
}
