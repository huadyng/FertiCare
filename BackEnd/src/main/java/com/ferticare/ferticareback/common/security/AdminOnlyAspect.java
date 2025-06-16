package com.ferticare.ferticareback.common.security;

import com.ferticare.ferticareback.common.security.annotation.AdminOnly;
import com.ferticare.ferticareback.features.role.entity.Role;
import com.ferticare.ferticareback.features.role.repository.RoleRepository;
import com.ferticare.ferticareback.features.user.entity.User;
import com.ferticare.ferticareback.features.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
@RequiredArgsConstructor
public class AdminOnlyAspect {

    private final UserService userService;
    private final RoleRepository roleRepository;

    @Pointcut("@annotation(com.ferticare.ferticareback.common.security.annotation.AdminOnly)")
    public void adminOnlyMethods() {
    }

    @Before("adminOnlyMethods()")
    public void checkAdminRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Role role = roleRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        if (role.getRoleLevel() != 4) {
            throw new RuntimeException("Access denied: Admin only.");
        }
    }
}