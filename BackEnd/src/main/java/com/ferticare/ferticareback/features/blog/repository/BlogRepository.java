package com.ferticare.ferticareback.features.blog.repository;

import com.ferticare.ferticareback.features.blog.entity.Blog;
import com.ferticare.ferticareback.features.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BlogRepository extends JpaRepository<Blog, UUID> {
    List<Blog> findByStatus(String status);
    List<Blog> findByAuthor(User author);
}
