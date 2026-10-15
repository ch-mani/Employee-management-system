package com.ems.service;

import com.ems.dto.ChangePasswordRequest;
import com.ems.dto.LoginRequest;
import com.ems.dto.LoginResponse;
import com.ems.dto.RegisterRequest;
import com.ems.dto.EmployeeRequest;
import com.ems.dto.RoleRequestDTO;
import com.ems.entity.Role;
import com.ems.entity.User;
import com.ems.repository.UserRepository;
import com.ems.security.CustomUserDetails;
import com.ems.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;
    private final EmployeeService employeeService;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        return issueTokenForUser(user, userDetails);
    }

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        String trimmedPassword = request.getPassword() == null ? "" : request.getPassword().trim();
        if (trimmedPassword.length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters long");
        }

        EmployeeRequest employeeRequest = new EmployeeRequest();
        employeeRequest.setEmpCode(request.getEmpCode());
        employeeRequest.setName(request.getName());
        employeeRequest.setEmail(request.getEmail());
        employeeRequest.setPhone(request.getPhone());
        employeeRequest.setDepartmentId(request.getDepartmentId());
        employeeRequest.setDesignation(request.getDesignation());
        employeeRequest.setSalary(request.getSalary());
        employeeRequest.setStatus(request.getStatus());

        employeeService.createEmployeeWithPassword(employeeRequest, trimmedPassword);
        User registeredUser = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Registered user account could not be found"));
        Role requestedRole = Role.valueOf(request.getRequestedRole());
        if (requestedRole != Role.EMPLOYEE) {
            registeredUser.setRequestedRole(requestedRole);
            userRepository.save(registeredUser);
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), trimmedPassword)
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        return issueTokenForUser(user, userDetails);
    }

    @Transactional(readOnly = true)
    public List<RoleRequestDTO> getRoleRequests() {
        return userRepository.findAllByRequestedRoleIsNotNull().stream()
                .map(user -> new RoleRequestDTO(
                        user.getId(),
                        user.getEmployee() == null ? user.getEmail() : user.getEmployee().getName(),
                        user.getEmail(),
                        user.getRequestedRole().name()))
                .toList();
    }

    @Transactional
    public void approveRoleRequest(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        if (user.getRequestedRole() == null) {
            throw new RuntimeException("No pending role request for user: " + userId);
        }
        user.setRole(user.getRequestedRole());
        user.setRequestedRole(null);
        user.setJwtSecret(null);
        userRepository.save(user);
    }

    @Transactional
    public void rejectRoleRequest(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        if (user.getRequestedRole() == null) {
            throw new RuntimeException("No pending role request for user: " + userId);
        }
        user.setRequestedRole(null);
        userRepository.save(user);
    }

    private LoginResponse issueTokenForUser(User user, CustomUserDetails userDetails) {
        String dynamicSecret = jwtUtils.generateSecretKey();
        user.setJwtSecret(dynamicSecret);
        userRepository.save(user);

        String token = jwtUtils.generateToken(userDetails, dynamicSecret);

        return new LoginResponse(
                token,
                user.getEmail(),
                user.getRole().name(),
                user.getId()
        );
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userDetails.getUser();
    }
    
    @Transactional
    public void logout() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            User user = userDetails.getUser();
            // Invalidate the JWT secret by clearing it
            user.setJwtSecret(null);
            userRepository.save(user);
        }
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = getCurrentUser();

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        // Invalidate current JWT so user has to re-login
        user.setJwtSecret(null);
        userRepository.save(user);
    }
}
