package com.ferticare.ferticareback.features.blog.service;

import com.ferticare.ferticareback.features.blog.dto.BlogRequest;
import com.ferticare.ferticareback.features.blog.dto.BlogResponse;

import java.util.List;
import java.util.UUID;

public interface BlogService {
    BlogResponse create(BlogRequest request, String authorEmail);
    BlogResponse getById(UUID id);
    List<BlogResponse> getPublishedBlogs();
    List<BlogResponse> getAllBlogs();
    List<BlogResponse> getBlogsByUser(String email);
    void approveBlog(UUID blogId);
    void archiveBlog(UUID id, String email);
    void deleteBlog(UUID blogId, String email);

}