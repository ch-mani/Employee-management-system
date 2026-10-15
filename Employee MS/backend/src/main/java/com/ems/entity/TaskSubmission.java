package com.ems.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "task_submissions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"employee_id", "submission_date"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskSubmission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private LocalDate submissionDate;

    @Column(columnDefinition = "TEXT")
    private String completedTasks;

    @Column(nullable = false)
    private int totalTasks;

    @Column(nullable = false)
    private int completedCount;

    @Column(nullable = false)
    private LocalDateTime submittedAt;
}
