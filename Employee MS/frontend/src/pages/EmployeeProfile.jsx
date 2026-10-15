import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { employeeService } from '../services/employeeService'
import { departmentService } from '../services/departmentService'
import { 
  Typography, 
  Grid, 
  Paper, 
  Box, 
  TextField, 
  Button, 
  CircularProgress,
  MenuItem,
  Alert
} from '@mui/material'

function EmployeeProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, hasRole } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [departments, setDepartments] = useState([])
  const [formData, setFormData] = useState({
    empCode: '',
    name: '',
    email: '',
    phone: '',
    departmentId: '',
    designation: '',
    salary: '',
    status: 'ACTIVE'
  })

  const isNewEmployee = id === 'new'
  const canEdit = hasRole(['ADMIN', 'HR']) || (!isNewEmployee && user?.userId === formData.userId)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      const departmentsData = await departmentService.getAll()
      setDepartments(departmentsData)

      if (!isNewEmployee) {
        const employee = await employeeService.getById(id)
        setFormData({
          empCode: employee.empCode || '',
          name: employee.name || '',
          email: employee.email || '',
          phone: employee.phone || '',
          departmentId: employee.departmentId || '',
          designation: employee.designation || '',
          salary: employee.salary || '',
          status: employee.status || 'ACTIVE'
        })
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const employeeData = {
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        departmentId: parseInt(formData.departmentId)
      }

      if (isNewEmployee) {
        await employeeService.create(employeeData)
        setSuccess(`Employee created successfully! Login credentials — Email: ${formData.email} | Default Password: password123`)
        setTimeout(() => navigate('/employees'), 4000)
      } else {
        await employeeService.update(id, employeeData)
        setSuccess('Employee updated successfully')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save employee')
    } finally {
      setSaving(false)
    }
  }

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
        {isNewEmployee ? 'Add Employee' : 'Employee Profile'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Employee Code"
                name="empCode"
                value={formData.empCode}
                onChange={handleChange}
                required
                disabled={!canEdit}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={!canEdit}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={!canEdit}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!canEdit}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Department"
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                required
                disabled={!canEdit}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                required
                disabled={!canEdit}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Salary"
                name="salary"
                type="number"
                value={formData.salary}
                onChange={handleChange}
                disabled={!canEdit}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={!canEdit}
              >
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </TextField>
            </Grid>
            
            {canEdit && (
              <Grid item xs={12}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  size="large"
                  disabled={saving}
                >
                  {saving ? <CircularProgress size={24} /> : (isNewEmployee ? 'Create Employee' : 'Save Changes')}
                </Button>
              </Grid>
            )}
          </Grid>
        </form>
      </Paper>
    </Box>
  )
}

export default EmployeeProfile
