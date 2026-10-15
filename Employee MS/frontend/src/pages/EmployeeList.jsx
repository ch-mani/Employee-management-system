import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { employeeService } from '../services/employeeService'
import { departmentService } from '../services/departmentService'
import { 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  Button,
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Badge
} from '@mui/material'
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  Business as BusinessIcon,
  People as PeopleIcon
} from '@mui/icons-material'

function EmployeeList() {
  const { hasRole } = useAuth()
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState(null) // null = All
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState(null)
  
  const canManageEmployees = hasRole(['ADMIN', 'HR'])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [employeesData, departmentsData] = await Promise.all([
        employeeService.getAll(),
        departmentService.getAll()
      ])
      setEmployees(employeesData)
      setDepartments(departmentsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await employeeService.delete(employeeToDelete.id)
      setEmployees(employees.filter(e => e.id !== employeeToDelete.id))
      setDeleteDialogOpen(false)
      setEmployeeToDelete(null)
    } catch (error) {
      console.error('Error deleting employee:', error)
    }
  }

  const openDeleteDialog = (employee) => {
    setEmployeeToDelete(employee)
    setDeleteDialogOpen(true)
  }

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.empCode.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDept = selectedDepartment === null || emp.departmentId === selectedDepartment
    return matchesSearch && matchesDept
  })

  // Count employees per department for badges
  const deptCounts = employees.reduce((acc, emp) => {
    acc[emp.departmentId] = (acc[emp.departmentId] || 0) + 1
    return acc
  }, {})

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Employees
        {selectedDepartment !== null && (
          <Chip 
            label={departments.find(d => d.id === selectedDepartment)?.name}
            color="primary"
            size="small"
            onDelete={() => setSelectedDepartment(null)}
            sx={{ ml: 2, verticalAlign: 'middle' }}
          />
        )}
      </Typography>
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
        
        {canManageEmployees && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/employees/new')}
          >
            Add Employee
          </Button>
        )}
      </Box>

      {/* Department Filter Chips */}
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        <BusinessIcon color="action" sx={{ mr: 0.5 }} />
        <Chip
          icon={<PeopleIcon />}
          label={`All Employees (${employees.length})`}
          color={selectedDepartment === null ? 'primary' : 'default'}
          variant={selectedDepartment === null ? 'filled' : 'outlined'}
          onClick={() => setSelectedDepartment(null)}
          sx={{ fontWeight: selectedDepartment === null ? 600 : 400 }}
        />
        {departments.map((dept) => (
          <Chip
            key={dept.id}
            label={`${dept.name} (${deptCounts[dept.id] || 0})`}
            color={selectedDepartment === dept.id ? 'primary' : 'default'}
            variant={selectedDepartment === dept.id ? 'filled' : 'outlined'}
            onClick={() => setSelectedDepartment(selectedDepartment === dept.id ? null : dept.id)}
            sx={{ fontWeight: selectedDepartment === dept.id ? 600 : 400 }}
          />
        ))}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Designation</TableCell>
              <TableCell>Status</TableCell>
              {canManageEmployees && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManageEmployees ? 7 : 6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  {selectedDepartment !== null 
                    ? `No employees found in ${departments.find(d => d.id === selectedDepartment)?.name || 'selected'} department`
                    : 'No employees found matching your search'}
                </TableCell>
              </TableRow>
            ) : (
            filteredEmployees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.empCode}</TableCell>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.departmentName}</TableCell>
                <TableCell>{employee.designation}</TableCell>
                <TableCell>{employee.status}</TableCell>
                {canManageEmployees && (
                  <TableCell align="right">
                    <IconButton 
                      color="primary" 
                      onClick={() => navigate(`/employees/${employee.id}`)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => openDeleteDialog(employee)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete employee {employeeToDelete?.name}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default EmployeeList
