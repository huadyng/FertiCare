package com.ferticare.ferticareback.features.comment.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class CommentRequest {
    private UUID blogId;      // ID của bài blog cần bình luận
    private String content;   // Nội dung bình luận
    private UUID parentId;    // Nếu là reply thì đây là comment cha
}