package com.ferticare.ferticareback.features.auth.controller;

import com.ferticare.ferticareback.common.dto.ErrorResponse;
import com.ferticare.ferticareback.common.security.JwtUtil;
import com.ferticare.ferticareback.features.auth.dto.LoginRequest;
import com.ferticare.ferticareback.features.auth.dto.LoginResponse;
import com.ferticare.ferticareback.features.role.entity.Role;
import com.ferticare.ferticareback.features.role.repository.RoleRepository;
import com.ferticare.ferticareback.features.user.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final RoleRepository roleRepository;

    public AuthController(UserService userService, JwtUtil jwtUtil, RoleRepository roleRepository) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.roleRepository = roleRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        var userOpt = userService.login(request.getEmail(), request.getPassword());

        if (userOpt.isPresent()) {
            var user = userOpt.get();

            // ✅ Lấy role từ bảng riêng
            Role role = roleRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Role not found"));

            // ✅ Sinh token với role từ bảng
            String token = jwtUtil.generateToken(user.getId(), role.getRoleType());

            LoginResponse loginResponse = LoginResponse.builder()
                    .id(user.getId())
                    .fullName(user.getFullName())
                    .email(user.getEmail())
                    .token(token)
                    .build();

            return ResponseEntity.ok(loginResponse);
        } else {
            ErrorResponse errorResponse = new ErrorResponse(
                    401,
                    "Unauthorized",
                    "Invalid email or password",
                    "/api/auth/login"
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }
}