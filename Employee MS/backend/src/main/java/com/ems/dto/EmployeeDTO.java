package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDTO {
    private Long id;
    private String empCode;
    private String name;
    private String email;
    private String phone;
    private Long departmentId;
    private String departmentName;
    private String designation;
    private Double salary;
    private String status;
    private Long userId;
}
