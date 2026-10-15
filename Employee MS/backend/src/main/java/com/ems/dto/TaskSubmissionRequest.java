package com.ems.dto;

import lombok.Data;

import java.util.List;

@Data
public class TaskSubmissionRequest {
    private List<String> completedTasks;
    private int totalTasks;
}
