package com.familymarket.dto;

import com.familymarket.skill.SkillActivation;

public record SkillActivationDto(
        Long childId,
        String childName,
        String childAvatar,
        String skill
) {
    public static SkillActivationDto from(SkillActivation activation) {
        return new SkillActivationDto(
                activation.getChild().getId(),
                activation.getChild().getName(),
                activation.getChild().getAvatarEmoji(),
                activation.getSkill());
    }
}