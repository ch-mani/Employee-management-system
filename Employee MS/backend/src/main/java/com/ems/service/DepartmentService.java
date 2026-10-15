package com.ems.service;

import com.ems.dto.DepartmentDTO;
import com.ems.entity.Department;
import com.ems.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public List<DepartmentDTO> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public DepartmentDTO getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));
        return mapToDTO(department);
    }

    @Transactional
    public DepartmentDTO createDepartment(DepartmentDTO departmentDTO) {
        if (departmentRepository.existsByName(departmentDTO.getName())) {
            throw new RuntimeException("Department with name already exists: " + departmentDTO.getName());
        }
        
        Department department = new Department();
        department.setName(departmentDTO.getName());
        department.setDescription(departmentDTO.getDescription());
        
        Department saved = departmentRepository.save(department);
        return mapToDTO(saved);
    }

    @Transactional
    public DepartmentDTO updateDepartment(Long id, DepartmentDTO departmentDTO) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));
        
        if (departmentRepository.existsByName(departmentDTO.getName()) 
                && !department.getName().equals(departmentDTO.getName())) {
            throw new RuntimeException("Department with name already exists: " + departmentDTO.getName());
        }
        
        department.setName(departmentDTO.getName());
        department.setDescription(departmentDTO.getDescription());
        
        Department updated = departmentRepository.save(department);
        return mapToDTO(updated);
    }

    @Transactional
    public void deleteDepartment(Long id) {
        if (!departmentRepository.existsById(id)) {
            throw new RuntimeException("Department not found with id: " + id);
        }
        departmentRepository.deleteById(id);
    }

    private DepartmentDTO mapToDTO(Department department) {
        DepartmentDTO dto = new DepartmentDTO();
        dto.setId(department.getId());
        dto.setName(department.getName());
        dto.setDescription(department.getDescription());
        dto.setEmployeeCount(department.getEmployees() != null ? department.getEmployees().size() : 0);
        return dto;
    }
}
