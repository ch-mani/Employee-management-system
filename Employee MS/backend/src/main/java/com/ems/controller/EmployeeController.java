package com.ems.controller;

import com.ems.dto.APIResponse;
import com.ems.dto.ChangePasswordRequest;
import com.ems.dto.EmployeeDTO;
import com.ems.dto.EmployeeRequest;
import com.ems.entity.Role;
import com.ems.entity.User;
import com.ems.service.AuthService;
import com.ems.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;
    private final AuthService authService;

    // ---- Self-service endpoints (must be defined BEFORE /{id} routes) ----

    @GetMapping("/me")
    public ResponseEntity<EmployeeDTO> getCurrentEmployee() {
        User currentUser = authService.getCurrentUser();
        EmployeeDTO employee = employeeService.getEmployeeByUserId(currentUser.getId());
        return ResponseEntity.ok(employee);
    }

    @PutMapping("/me")
    public ResponseEntity<EmployeeDTO> updateMyProfile(@Valid @RequestBody EmployeeRequest request) {
        User currentUser = authService.getCurrentUser();
        EmployeeDTO employee = employeeService.getEmployeeByUserId(currentUser.getId());
        EmployeeDTO updated = employeeService.updateEmployee(employee.getId(), request, false);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/me/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        try {
            authService.changePassword(request);
            return ResponseEntity.ok(new APIResponse<>(true, "Password changed successfully. Please login again.", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new APIResponse<>(false, e.getMessage(), null));
        }
    }

    // ---- Admin/HR endpoints ----

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<EmployeeDTO>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<EmployeeDTO> getEmployee(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<EmployeeDTO> createEmployee(@Valid @RequestBody EmployeeRequest request) {
        EmployeeDTO created = employeeService.createEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<EmployeeDTO> updateEmployee(
            @PathVariable Long id, 
            @Valid @RequestBody EmployeeRequest request) {
        User currentUser = authService.getCurrentUser();
        boolean isAdminOrHR = currentUser.getRole() == Role.ADMIN || currentUser.getRole() == Role.HR;
        EmployeeDTO updated = employeeService.updateEmployee(id, request, isAdminOrHR);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }
}
