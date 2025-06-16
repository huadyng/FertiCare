package com.ferticare.ferticareback.features.auth.controller;

import com.ferticare.ferticareback.common.security.annotation.DoctorOnly;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/doctor")
public class DoctorController {

    @DoctorOnly
    @GetMapping("/schedule")
    public ResponseEntity<?> getSchedule() {
        return ResponseEntity.ok("Welcome Doctor! Here is your schedule.");
    }
}