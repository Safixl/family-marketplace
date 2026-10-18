package com.familymarket.dto;

import java.util.List;
import java.util.Map;

public record ChildReadingResponse(List<ChildBookDto> books, List<ReadingRequestDto> requests,
                                   ReadingStatsDto stats,
                                   Map<Long, Integer> bookmarks,
                                   int pagesToday, int pagesTarget) {
}