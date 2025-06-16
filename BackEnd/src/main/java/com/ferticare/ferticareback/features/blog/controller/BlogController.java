package com.ferticare.ferticareback.features.blog.controller;

import com.ferticare.ferticareback.common.security.annotation.ManagerOnly;
import com.ferticare.ferticareback.features.blog.dto.BlogRequest;
import com.ferticare.ferticareback.features.blog.dto.BlogResponse;
import com.ferticare.ferticareback.features.blog.entity.Blog;
import com.ferticare.ferticareback.features.blog.service.BlogService;
import com.ferticare.ferticareback.features.user.entity.User;
import com.ferticare.ferticareback.features.user.service.UserService;
import com.ferticare.ferticareback.features.role.entity.Role;
import com.ferticare.ferticareback.features.role.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/blogs")
@RequiredArgsConstructor
public class BlogController {

    private final BlogService blogService;
    private final UserService userService;
    private final RoleRepository roleRepository;

    @PostMapping
    public ResponseEntity<BlogResponse> createBlog(@RequestBody BlogRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        request.setStatus("draft");
        return ResponseEntity.ok(blogService.create(request, email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlogResponse> getBlogById(@PathVariable UUID id) {
        BlogResponse blog = blogService.getById(id);
        if (!"published".equalsIgnoreCase(blog.getStatus())) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User user = userService.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
            boolean isAuthor = blog.getAuthorName().equals(user.getFullName());
            Role role = roleRepository.findByUser(user).orElseThrow(() -> new RuntimeException("Role not found"));
            boolean isManager = role.getRoleLevel() == 3;

            if (!isAuthor && !isManager) {
                throw new RuntimeException("Access denied: only author or manager can view this blog");
            }
        }
        return ResponseEntity.ok(blog);
    }

    @GetMapping("/published")
    public ResponseEntity<List<BlogResponse>> getPublishedBlogs() {
        return ResponseEntity.ok(blogService.getPublishedBlogs());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBlog(@PathVariable UUID id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        blogService.deleteBlog(id, email);
        return ResponseEntity.ok("Deleted");
    }


    @PutMapping("/{id}/archive")
    public ResponseEntity<?> archiveBlog(@PathVariable UUID id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        blogService.archiveBlog(id, email);
        return ResponseEntity.ok("Blog archived.");
    }

    @PutMapping("/{id}/approve")
    @ManagerOnly
    public ResponseEntity<?> approveBlog(@PathVariable UUID id) {
        blogService.approveBlog(id);
        return ResponseEntity.ok("Blog approved and published.");
    }

    @GetMapping("/all")
    @ManagerOnly
    public ResponseEntity<List<BlogResponse>> getAllBlogsForManager() {
        return ResponseEntity.ok(blogService.getAllBlogs());
    }

    @GetMapping("/my")
    public ResponseEntity<List<BlogResponse>> getMyBlogs() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return ResponseEntity.ok(blogService.getBlogsByUser(email));
    }


}
