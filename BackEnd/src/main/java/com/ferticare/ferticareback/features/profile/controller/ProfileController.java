package com.ferticare.ferticareback.features.profile.controller;

import com.ferticare.ferticareback.features.profile.dto.BaseProfileResponse;
import com.ferticare.ferticareback.features.profile.dto.CustomerProfileResponse;
import com.ferticare.ferticareback.features.profile.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

//    @GetMapping("/me")
//    public ResponseEntity<BaseProfileResponse> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
//        UUID userId = UUID.fromString(userDetails.getUsername());
//        BaseProfileResponse response = profileService.getProfileByUserId(userId);
//        return ResponseEntity.ok(response);
//    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Principal principal) {
        UUID userId = UUID.fromString(principal.getName()); // principal.getName() chính là userId string
        BaseProfileResponse response = profileService.getProfileByUserId(userId);
        return ResponseEntity.ok(response);
    }


}