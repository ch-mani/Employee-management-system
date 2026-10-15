import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import { departmentService } from '../services/departmentService'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

function Register() {
  const [formData, setFormData] = useState({
    empCode: '',
    name: '',
    email: '',
    phone: '',
    departmentId: '',
    requestedRole: 'EMPLOYEE',
    designation: '',
    salary: '',
    password: '',
    confirmPassword: '',
  })
  const [departments, setDepartments] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await departmentService.getAll()
        setDepartments(data)
      } catch (err) {
        console.error('Unable to load departments:', err)
      }
    }

    fetchDepartments()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const response = await authService.register({
        empCode: formData.empCode,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        departmentId: Number(formData.departmentId),
        requestedRole: formData.requestedRole,
        designation: formData.designation,
        salary: Number(formData.salary),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      })

      login(response.token)
      navigate('/dashboard', {
        state: {
          roleRequest: formData.requestedRole === 'EMPLOYEE' ? null : formData.requestedRole,
        },
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, width: '100%', maxWidth: 700 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Registration
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Create your employee account to access the system.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Employee Code"
                  name="empCode"
                  value={formData.empCode}
                  onChange={handleChange}
                  required
                />
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  select
                  fullWidth
                  label="Department"
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  required
                >
                  {departments.map((department) => (
                    <MenuItem key={department.id} value={department.id}>
                      {department.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  label="Role"
                  name="requestedRole"
                  select
                  value={formData.requestedRole}
                  onChange={handleChange}
                  helperText={formData.requestedRole === 'EMPLOYEE'
                    ? 'Employee access is assigned when you register.'
                    : 'Admin approval is required. You will have Employee access until approved.'}
                  required
                >
                  <MenuItem value="EMPLOYEE">Employee</MenuItem>
                  <MenuItem value="HR">HR</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                </TextField>
              </Stack>
              <TextField
                fullWidth
                label="Designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                required
              />

              <TextField
                fullWidth
                label="Salary"
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                inputProps={{ min: 0, step: '0.01' }}
                required
              />

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </Stack>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Account'}
              </Button>
            </Stack>
          </form>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Already have an account?{' '}
            <Button component={RouterLink} to="/login" variant="text" size="small">
              Sign in
            </Button>
          </Typography>
        </Paper>
      </Box>
    </Container>
  )
}

export default Register
