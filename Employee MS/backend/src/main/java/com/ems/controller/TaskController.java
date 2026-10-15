package com.ems.controller;

import com.ems.dto.TaskSubmissionDTO;
import com.ems.dto.TaskSubmissionRequest;
import com.ems.entity.Employee;
import com.ems.entity.TaskSubmission;
import com.ems.entity.User;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.TaskSubmissionRepository;
import com.ems.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskSubmissionRepository taskSubmissionRepository;
    private final EmployeeRepository employeeRepository;
    private final AuthService authService;

    @PostMapping("/submit")
    public ResponseEntity<?> submitDailyTasks(@RequestBody TaskSubmissionRequest request) {
        User currentUser = authService.getCurrentUser();
        Employee employee = employeeRepository.findByUser(currentUser)
                .orElseThrow(() -> new RuntimeException("Employee not found for current user"));

        LocalDate today = LocalDate.now();

        // Check if already submitted today
        if (taskSubmissionRepository.existsByEmployeeAndSubmissionDate(employee, today)) {
            return ResponseEntity.badRequest().body(
                    new com.ems.dto.APIResponse<>(false, "Tasks already submitted for today", null));
        }

        TaskSubmission submission = new TaskSubmission();
        submission.setEmployee(employee);
        submission.setSubmissionDate(today);
        submission.setCompletedTasks(String.join("||", request.getCompletedTasks()));
        submission.setTotalTasks(request.getTotalTasks());
        submission.setCompletedCount(request.getCompletedTasks().size());
        submission.setSubmittedAt(LocalDateTime.now());

        taskSubmissionRepository.save(submission);

        return ResponseEntity.ok(new com.ems.dto.APIResponse<>(true, "Tasks submitted successfully!", null));
    }

    @GetMapping("/today")
    public ResponseEntity<?> getTodaySubmission() {
        User currentUser = authService.getCurrentUser();
        Employee employee = employeeRepository.findByUser(currentUser)
                .orElseThrow(() -> new RuntimeException("Employee not found for current user"));

        LocalDate today = LocalDate.now();
        return taskSubmissionRepository.findByEmployeeAndSubmissionDate(employee, today)
                .map(sub -> ResponseEntity.ok(mapToDTO(sub)))
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/history")
    public ResponseEntity<List<TaskSubmissionDTO>> getTaskHistory() {
        User currentUser = authService.getCurrentUser();
        Employee employee = employeeRepository.findByUser(currentUser)
                .orElseThrow(() -> new RuntimeException("Employee not found for current user"));

        List<TaskSubmissionDTO> history = taskSubmissionRepository
                .findByEmployeeOrderBySubmissionDateDesc(employee)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(history);
    }

    private TaskSubmissionDTO mapToDTO(TaskSubmission sub) {
        TaskSubmissionDTO dto = new TaskSubmissionDTO();
        dto.setId(sub.getId());
        dto.setSubmissionDate(sub.getSubmissionDate());
        dto.setCompletedTasks(Arrays.asList(sub.getCompletedTasks().split("\\|\\|")));
        dto.setTotalTasks(sub.getTotalTasks());
        dto.setCompletedCount(sub.getCompletedCount());
        dto.setSubmittedAt(sub.getSubmittedAt());
        return dto;
    }
}
