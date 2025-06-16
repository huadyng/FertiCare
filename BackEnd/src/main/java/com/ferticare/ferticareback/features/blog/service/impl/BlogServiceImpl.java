package com.ferticare.ferticareback.features.blog.service.impl;

import com.ferticare.ferticareback.features.blog.dto.BlogRequest;
import com.ferticare.ferticareback.features.blog.dto.BlogResponse;
import com.ferticare.ferticareback.features.blog.entity.Blog;
import com.ferticare.ferticareback.features.blog.repository.BlogRepository;
import com.ferticare.ferticareback.features.blog.service.BlogService;
import com.ferticare.ferticareback.features.role.entity.Role;
import com.ferticare.ferticareback.features.role.repository.RoleRepository;
import com.ferticare.ferticareback.features.user.entity.User;
import com.ferticare.ferticareback.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BlogServiceImpl implements BlogService {

    private final BlogRepository blogRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    public BlogResponse create(BlogRequest request, String authorEmail) {
        User author = userRepository.findByEmail(authorEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Blog blog = Blog.builder()
                .author(author)
                .title(request.getTitle())
                .content(request.getContent())
                .coverImage(request.getCoverImage())
                .tags(request.getTags())
                .status(request.getStatus())
                .build();

        Blog saved = blogRepository.save(blog);
        return toResponse(saved);
    }

    @Override
    public BlogResponse getById(UUID id) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found"));
        return toResponse(blog);
    }

    @Override
    public List<BlogResponse> getPublishedBlogs() {
        return blogRepository.findByStatus("published").stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public void archiveBlog(UUID id, String email) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found"));

        if (!blog.getAuthor().getEmail().equals(email)) {
            Role role = roleRepository.findByUser(blog.getAuthor())
                    .orElseThrow(() -> new RuntimeException("Role not found"));
            if (role.getRoleLevel() != 3) {
                throw new RuntimeException("Unauthorized to archive blog");
            }
        }

        blog.setStatus("archived");
        blog.setUpdatedAt(LocalDateTime.now());
        blogRepository.save(blog);
    }

    private BlogResponse toResponse(Blog blog) {
        return BlogResponse.builder()
                .blogId(blog.getBlogId())
                .authorName(blog.getAuthor().getFullName())
                .title(blog.getTitle())
                .content(blog.getContent())
                .coverImage(blog.getCoverImage())
                .tags(blog.getTags())
                .status(blog.getStatus())
                .viewCount(blog.getViewCount())
                .createdAt(blog.getCreatedAt())
                .updatedAt(blog.getUpdatedAt())
                .build();
    }

    @Override
    public void approveBlog(UUID blogId) {
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new RuntimeException("Blog not found"));

        blog.setStatus("published");
        blog.setUpdatedAt(LocalDateTime.now());
        blogRepository.save(blog);
    }

    @Override
    public List<BlogResponse> getAllBlogs() {
        return blogRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public List<BlogResponse> getBlogsByUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return blogRepository.findByAuthor(user).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public void deleteBlog(UUID blogId, String email) {
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new RuntimeException("Blog not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Role role = roleRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        boolean isAuthor = blog.getAuthor().getId().equals(user.getId());
        boolean isManager = role.getRoleLevel() == 3;

        if (!isAuthor && !isManager) {
            throw new RuntimeException("Access denied: only author or manager can delete");
        }

        blogRepository.delete(blog);
    }


}
