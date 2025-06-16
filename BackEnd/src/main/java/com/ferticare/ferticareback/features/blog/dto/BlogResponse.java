package com.ferticare.ferticareback.features.blog.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class BlogResponse {
    private UUID blogId;
    private String authorName;
    private String title;
    private String content;
    private String coverImage;
    private String tags;
    private String status;
    private int viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
