-- Insert default departments
INSERT INTO departments (name, description) VALUES 
('IT', 'Information Technology Department'),
('HR', 'Human Resources Department'),
('Finance', 'Finance Department'),
('Marketing', 'Marketing Department'),
('Operations', 'Operations Department')
ON DUPLICATE KEY UPDATE name=name;

-- Insert default users (password: password123 for all)
-- BCrypt hash for 'password123' 
-- ADMIN user
INSERT INTO users (email, password, role) VALUES 
('admin@ems.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rsW4WzOFbMB3dHI.IG', 'ADMIN')
ON DUPLICATE KEY UPDATE email=email;

-- HR user
INSERT INTO users (email, password, role) VALUES 
('hr@ems.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rsW4WzOFbMB3dHI.IG', 'HR')
ON DUPLICATE KEY UPDATE email=email;

-- EMPLOYEE user
INSERT INTO users (email, password, role) VALUES 
('employee@ems.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rsW4WzOFbMB3dHI.IG', 'EMPLOYEE')
ON DUPLICATE KEY UPDATE email=email;

-- Insert sample employees
INSERT INTO employees (emp_code, name, email, phone, department_id, designation, salary, status, user_id) VALUES
('EMP001', 'John Smith', 'john.smith@ems.com', '1234567890', 1, 'Software Engineer', 75000.00, 'ACTIVE', 
 (SELECT id FROM users WHERE email='employee@ems.com')),
('EMP002', 'Sarah Johnson', 'sarah.johnson@ems.com', '9876543210', 2, 'HR Manager', 65000.00, 'ACTIVE',
 (SELECT id FROM users WHERE email='hr@ems.com'))
ON DUPLICATE KEY UPDATE emp_code=emp_code;
