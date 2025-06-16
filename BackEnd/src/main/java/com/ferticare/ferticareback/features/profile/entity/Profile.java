package com.ferticare.ferticareback.features.profile.entity;

import com.ferticare.ferticareback.features.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "Profile")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Profile {

    @Id
    @GeneratedValue
    @Column(name = "profile_id", columnDefinition = "uniqueidentifier")
    private UUID profileId;

    @OneToOne(fetch = FetchType.EAGER) // hoặc LAZY nếu dùng @Transactional
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Dành cho Doctor
    private String specialty;
    private String qualification;
    private Integer experienceYears;
    private String workSchedule;
    private Double rating;
    private Integer caseCount;
    private String notes;
    private String status;

    // Dành cho Customer
    private String maritalStatus;
    private String healthBackground;

    // Dành cho Manager / Admin
    private String assignedDepartment;
    private String extraPermissions;
}