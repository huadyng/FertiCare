package com.ferticare.ferticareback.features.auth.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class LoginResponse {
    private UUID id;
    private String fullName;
    private String email;
    private String token;
}