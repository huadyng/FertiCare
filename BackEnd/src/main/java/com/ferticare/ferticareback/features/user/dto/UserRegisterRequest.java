package com.ferticare.ferticareback.features.user.dto;

import com.ferticare.ferticareback.features.role.entity.RoleType;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UserRegisterRequest {
    private String fullName;
    private String gender;
    private LocalDate dateOfBirth;
    private String email;
    private String phone;
    private String address;
    private String avatarUrl;
    private String password;
}