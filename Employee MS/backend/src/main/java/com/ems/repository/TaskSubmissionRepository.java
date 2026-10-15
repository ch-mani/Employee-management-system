package com.ems.repository;

import com.ems.entity.Employee;
import com.ems.entity.TaskSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskSubmissionRepository extends JpaRepository<TaskSubmission, Long> {
    Optional<TaskSubmission> findByEmployeeAndSubmissionDate(Employee employee, LocalDate date);
    List<TaskSubmission> findByEmployeeOrderBySubmissionDateDesc(Employee employee);
    boolean existsByEmployeeAndSubmissionDate(Employee employee, LocalDate date);
}
