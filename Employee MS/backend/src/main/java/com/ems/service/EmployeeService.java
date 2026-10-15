package com.ems.service;

import com.ems.dto.EmployeeDTO;
import com.ems.dto.EmployeeRequest;
import com.ems.entity.Department;
import com.ems.entity.Employee;
import com.ems.entity.Role;
import com.ems.entity.User;
import com.ems.repository.DepartmentRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<EmployeeDTO> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public EmployeeDTO getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
        return mapToDTO(employee);
    }

    private static final String DEFAULT_PASSWORD = "password123";

    @Transactional
    public EmployeeDTO createEmployee(EmployeeRequest request) {
        return createEmployeeWithPassword(request, DEFAULT_PASSWORD);
    }

    @Transactional
    public EmployeeDTO createEmployeeWithPassword(EmployeeRequest request, String password) {
        if (employeeRepository.existsByEmpCode(request.getEmpCode())) {
            throw new RuntimeException("Employee code already exists: " + request.getEmpCode());
        }
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists: " + request.getEmail());
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("A user account with this email already exists: " + request.getEmail());
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + request.getDepartmentId()));

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(Role.EMPLOYEE);
        user = userRepository.save(user);

        Employee employee = new Employee();
        employee.setEmpCode(request.getEmpCode());
        employee.setName(request.getName());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setDepartment(department);
        employee.setDesignation(request.getDesignation());
        employee.setSalary(request.getSalary());
        employee.setStatus(Employee.EmployeeStatus.valueOf(request.getStatus()));
        employee.setUser(user);

        Employee saved = employeeRepository.save(employee);
        return mapToDTO(saved);
    }

    @Transactional
    public EmployeeDTO updateEmployee(Long id, EmployeeRequest request, boolean isAdminOrHR) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));

        if (employeeRepository.existsByEmpCode(request.getEmpCode()) 
                && !employee.getEmpCode().equals(request.getEmpCode())) {
            throw new RuntimeException("Employee code already exists: " + request.getEmpCode());
        }
        if (employeeRepository.existsByEmail(request.getEmail()) 
                && !employee.getEmail().equals(request.getEmail())) {
            throw new RuntimeException("Email already exists: " + request.getEmail());
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + request.getDepartmentId()));

        employee.setEmpCode(request.getEmpCode());
        employee.setName(request.getName());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setDepartment(department);
        employee.setDesignation(request.getDesignation());
        employee.setStatus(Employee.EmployeeStatus.valueOf(request.getStatus()));

        if (isAdminOrHR && request.getSalary() != null) {
            employee.setSalary(request.getSalary());
        }

        Employee updated = employeeRepository.save(employee);
        return mapToDTO(updated);
    }

    @Transactional
    public void deleteEmployee(Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new RuntimeException("Employee not found with id: " + id);
        }
        
        Employee employee = employeeRepository.findById(id).get();
        if (employee.getUser() != null) {
            userRepository.delete(employee.getUser());
        }
        
        employeeRepository.deleteById(id);
    }

    public EmployeeDTO getEmployeeByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        Employee employee = employeeRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Employee not found for user"));
        
        return mapToDTO(employee);
    }

    private EmployeeDTO mapToDTO(Employee employee) {
        EmployeeDTO dto = new EmployeeDTO();
        dto.setId(employee.getId());
        dto.setEmpCode(employee.getEmpCode());
        dto.setName(employee.getName());
        dto.setEmail(employee.getEmail());
        dto.setPhone(employee.getPhone());
        dto.setDesignation(employee.getDesignation());
        dto.setSalary(employee.getSalary());
        dto.setStatus(employee.getStatus().name());
        
        if (employee.getDepartment() != null) {
            dto.setDepartmentId(employee.getDepartment().getId());
            dto.setDepartmentName(employee.getDepartment().getName());
        }
        
        if (employee.getUser() != null) {
            dto.setUserId(employee.getUser().getId());
        }
        
        return dto;
    }
}
