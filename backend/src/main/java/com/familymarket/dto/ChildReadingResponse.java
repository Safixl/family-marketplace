package com.familymarket.dto;

import java.util.List;

public record ChildReadingResponse(List<ChildBookDto> books, List<ReadingRequestDto> requests,
                                   ReadingStatsDto stats) {
}