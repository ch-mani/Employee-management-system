package com.ems.controller;

import com.ems.dto.APIResponse;
import com.ems.dto.ChangePasswordRequest;
import com.ems.dto.LoginRequest;
import com.ems.dto.LoginResponse;
import com.ems.dto.RegisterRequest;
import com.ems.dto.RoleRequestDTO;
import com.ems.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            LoginResponse response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new APIResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/role-requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RoleRequestDTO>> getRoleRequests() {
        return ResponseEntity.ok(authService.getRoleRequests());
    }

    @PostMapping("/role-requests/{userId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveRoleRequest(@PathVariable Long userId) {
        authService.approveRoleRequest(userId);
        return ResponseEntity.ok(new APIResponse<>(true, "Role request approved", null));
    }

    @PostMapping("/role-requests/{userId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectRoleRequest(@PathVariable Long userId) {
        authService.rejectRoleRequest(userId);
        return ResponseEntity.ok(new APIResponse<>(true, "Role request rejected", null));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        return ResponseEntity.ok(authService.getCurrentUser());
    }
}
