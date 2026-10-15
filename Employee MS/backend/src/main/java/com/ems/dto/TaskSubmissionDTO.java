package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskSubmissionDTO {
    private Long id;
    private LocalDate submissionDate;
    private List<String> completedTasks;
    private int totalTasks;
    private int completedCount;
    private LocalDateTime submittedAt;
}
