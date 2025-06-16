package com.ferticare.ferticareback.features.comment.repository;

import com.ferticare.ferticareback.features.comment.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {

    // Trả về tất cả comment của 1 blog, chỉ lấy comment đang hiển thị
    List<Comment> findByBlogBlogIdAndIsVisibleTrueOrderByCreatedAtAsc(UUID blogId);
}