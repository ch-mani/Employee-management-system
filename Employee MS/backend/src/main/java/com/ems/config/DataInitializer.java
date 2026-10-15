package com.ems.config;

import com.ems.entity.Department;
import com.ems.entity.Employee;
import com.ems.entity.Role;
import com.ems.entity.User;
import com.ems.repository.DepartmentRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Initialize departments if not exist
        if (departmentRepository.count() == 0) {
            log.info("Initializing departments...");
            
            Department it = new Department();
            it.setName("IT");
            it.setDescription("Information Technology Department");
            it.setEmployees(new ArrayList<>());
            departmentRepository.save(it);
            
            Department hr = new Department();
            hr.setName("HR");
            hr.setDescription("Human Resources Department");
            hr.setEmployees(new ArrayList<>());
            departmentRepository.save(hr);
            
            Department finance = new Department();
            finance.setName("Finance");
            finance.setDescription("Finance Department");
            finance.setEmployees(new ArrayList<>());
            departmentRepository.save(finance);
            
            Department marketing = new Department();
            marketing.setName("Marketing");
            marketing.setDescription("Marketing Department");
            marketing.setEmployees(new ArrayList<>());
            departmentRepository.save(marketing);
            
            Department operations = new Department();
            operations.setName("Operations");
            operations.setDescription("Operations Department");
            operations.setEmployees(new ArrayList<>());
            departmentRepository.save(operations);
            
            log.info("Departments initialized successfully");
        }

        // Initialize users if not exist
        if (userRepository.count() == 0) {
            log.info("Initializing users...");
            
            // Admin user
            User admin = new User();
            admin.setEmail("admin@ems.com");
            admin.setPassword(passwordEncoder.encode("password123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            
            // HR user
            User hr = new User();
            hr.setEmail("hr@ems.com");
            hr.setPassword(passwordEncoder.encode("password123"));
            hr.setRole(Role.HR);
            userRepository.save(hr);
            
            // Employee user
            User employee = new User();
            employee.setEmail("employee@ems.com");
            employee.setPassword(passwordEncoder.encode("password123"));
            employee.setRole(Role.EMPLOYEE);
            userRepository.save(employee);
            
            log.info("Users initialized successfully");

            // Create sample Employee records linked to users
            Department itDept = departmentRepository.findAll().stream()
                    .filter(d -> "IT".equals(d.getName())).findFirst().orElse(null);
            Department hrDept = departmentRepository.findAll().stream()
                    .filter(d -> "HR".equals(d.getName())).findFirst().orElse(null);

            if (itDept != null) {
                Employee emp1 = new Employee();
                emp1.setEmpCode("EMP001");
                emp1.setName("John Smith");
                emp1.setEmail("employee@ems.com");
                emp1.setPhone("1234567890");
                emp1.setDepartment(itDept);
                emp1.setDesignation("Software Engineer");
                emp1.setSalary(75000.0);
                emp1.setStatus(Employee.EmployeeStatus.ACTIVE);
                emp1.setUser(employee);
                employeeRepository.save(emp1);
            }

            if (hrDept != null) {
                Employee emp2 = new Employee();
                emp2.setEmpCode("EMP002");
                emp2.setName("Sarah Johnson");
                emp2.setEmail("hr@ems.com");
                emp2.setPhone("9876543210");
                emp2.setDepartment(hrDept);
                emp2.setDesignation("HR Manager");
                emp2.setSalary(65000.0);
                emp2.setStatus(Employee.EmployeeStatus.ACTIVE);
                emp2.setUser(hr);
                employeeRepository.save(emp2);
            }

            log.info("Sample employees initialized successfully");
        }
    }
}
