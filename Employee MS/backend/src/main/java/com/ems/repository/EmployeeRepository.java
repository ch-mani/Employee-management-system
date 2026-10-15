package com.ems.repository;

import com.ems.entity.Employee;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import com.ems.entity.User;


@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmpCode(String empCode);
    Optional<Employee> findByEmail(String email);
    Optional<Employee> findByUser(User user);
    boolean existsByEmpCode(String empCode);
    boolean existsByEmail(String email);
}
