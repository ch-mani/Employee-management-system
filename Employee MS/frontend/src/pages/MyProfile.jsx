import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { employeeService } from '../services/employeeService'
import { authService } from '../services/authService'
import {
  Typography,
  Grid,
  Paper,
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider
} from '@mui/material'
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Lock as LockIcon
} from '@mui/icons-material'

function MyProfile() {
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  })

  // Change password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const data = await employeeService.getCurrentEmployee()
      setProfile(data)
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
      })
    } catch (err) {
      setError('Failed to load profile. Your account may not have an employee record linked.')
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
      const updateData = {
        empCode: profile.empCode,
        name: formData.name,
        email: profile.email,
        phone: formData.phone,
        departmentId: profile.departmentId,
        designation: profile.designation,
        salary: profile.salary,
        status: profile.status,
      }
      const updated = await employeeService.updateMyProfile(updateData)
      setProfile(updated)
      setSuccess('Profile updated successfully!')
      setEditing(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: profile.name || '',
      phone: profile.phone || '',
    })
    setEditing(false)
    setError('')
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    setChangingPassword(true)
    try {
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword)
      setPasswordSuccess('Password changed successfully! You will be logged out...')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => logout(), 2000)
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!profile) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>My Profile</Typography>
        <Alert severity="warning">
          No employee profile found for your account. Please contact your administrator.
        </Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">My Profile</Typography>
        {!editing && (
          <Button variant="contained" onClick={() => setEditing(true)}>
            Edit Profile
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: 4 }}>
        {/* Read-only info section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Chip label={profile.status} color={profile.status === 'ACTIVE' ? 'success' : 'default'} />
            <Chip label={profile.departmentName} color="primary" variant="outlined" />
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <BadgeIcon fontSize="small" />
                <Typography variant="body2">Employee Code</Typography>
              </Box>
              <Typography variant="body1" sx={{ ml: 4, fontWeight: 500 }}>{profile.empCode}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <EmailIcon fontSize="small" />
                <Typography variant="body2">Email</Typography>
              </Box>
              <Typography variant="body1" sx={{ ml: 4, fontWeight: 500 }}>{profile.email}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <WorkIcon fontSize="small" />
                <Typography variant="body2">Designation</Typography>
              </Box>
              <Typography variant="body1" sx={{ ml: 4, fontWeight: 500 }}>{profile.designation}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <BusinessIcon fontSize="small" />
                <Typography variant="body2">Department</Typography>
              </Box>
              <Typography variant="body1" sx={{ ml: 4, fontWeight: 500 }}>{profile.departmentName}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Editable fields */}
        <Typography variant="h6" gutterBottom>
          {editing ? 'Edit Your Details' : 'Personal Details'}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={!editing}
                InputProps={{ startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!editing}
                InputProps={{ startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
              />
            </Grid>

            {editing && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={saving}
                  >
                    {saving ? <CircularProgress size={24} /> : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </form>
      </Paper>

      {/* Change Password Section */}
      <Paper sx={{ p: 4, mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <LockIcon color="primary" />
          <Typography variant="h6">Change Password</Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />

        {passwordError && <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>}
        {passwordSuccess && <Alert severity="success" sx={{ mb: 2 }}>{passwordSuccess}</Alert>}

        <form onSubmit={handlePasswordSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="password"
                label="Current Password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="password"
                label="New Password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                helperText="Minimum 6 characters"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="password"
                label="Confirm New Password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="warning"
                disabled={changingPassword}
              >
                {changingPassword ? <CircularProgress size={24} /> : 'Change Password'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  )
}

export default MyProfile
