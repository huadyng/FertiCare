package com.ferticare.ferticareback.features.role.repository;

import com.ferticare.ferticareback.features.role.entity.Role;
import com.ferticare.ferticareback.features.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByUserId(UUID userId);
    Optional<Role> findByUser(User user);

}
