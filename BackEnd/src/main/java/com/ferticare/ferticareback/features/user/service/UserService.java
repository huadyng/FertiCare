package com.ferticare.ferticareback.features.user.service;

import com.ferticare.ferticareback.features.role.entity.RoleType;
import com.ferticare.ferticareback.features.user.entity.User;

import java.util.Optional;
import java.util.UUID;

public interface UserService {
    User save(User user, RoleType role);
    Optional<User> findById(UUID id);
    Optional<User> findByEmail(String email);
    // Hàm login
    Optional<User> login(String email, String rawPassword);
}