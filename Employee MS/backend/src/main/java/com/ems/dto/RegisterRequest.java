package com.ems.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Employee code is required")
    private String empCode;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String phone;

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    @NotBlank(message = "Role is required")
    @Pattern(regexp = "EMPLOYEE|HR|ADMIN", message = "Invalid role")
    private String requestedRole;

    @NotBlank(message = "Designation is required")
    private String designation;

    @Positive(message = "Salary must be positive")
    private Double salary;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;

    private String status = "ACTIVE";
}
