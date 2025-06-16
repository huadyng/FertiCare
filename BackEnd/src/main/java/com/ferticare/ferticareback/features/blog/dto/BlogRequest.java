package com.ferticare.ferticareback.features.blog.dto;

import lombok.Data;

@Data
public class BlogRequest {
    private String title;
    private String content;
    private String coverImage;
    private String tags;
    private String status;
}