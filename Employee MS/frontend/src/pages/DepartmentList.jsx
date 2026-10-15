import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
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
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material'
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon
} from '@mui/icons-material'

function DepartmentList() {
  const { hasRole } = useAuth()
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState(null)
  const [departmentToDelete, setDepartmentToDelete] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  const canManageDepartments = hasRole(['ADMIN', 'HR'])

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      const data = await departmentService.getAll()
      setDepartments(data)
    } catch (error) {
      console.error('Error fetching departments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (department = null) => {
    if (department) {
      setEditingDepartment(department)
      setFormData({
        name: department.name,
        description: department.description || ''
      })
    } else {
      setEditingDepartment(null)
      setFormData({
        name: '',
        description: ''
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingDepartment(null)
    setFormData({ name: '', description: '' })
  }

  const handleSubmit = async () => {
    try {
      if (editingDepartment) {
        await departmentService.update(editingDepartment.id, formData)
      } else {
        await departmentService.create(formData)
      }
      fetchDepartments()
      handleCloseDialog()
    } catch (error) {
      console.error('Error saving department:', error)
    }
  }

  const handleDelete = async () => {
    try {
      await departmentService.delete(departmentToDelete.id)
      setDepartments(departments.filter(d => d.id !== departmentToDelete.id))
      setDeleteDialogOpen(false)
      setDepartmentToDelete(null)
    } catch (error) {
      console.error('Error deleting department:', error)
    }
  }

  const openDeleteDialog = (department) => {
    setDepartmentToDelete(department)
    setDeleteDialogOpen(true)
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
        Departments
      </Typography>

      {canManageDepartments && (
        <Box sx={{ mb: 3 }}>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Department
          </Button>
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Employee Count</TableCell>
              {canManageDepartments && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {departments.map((department) => (
              <TableRow key={department.id}>
                <TableCell>{department.name}</TableCell>
                <TableCell>{department.description}</TableCell>
                <TableCell>{department.employeeCount}</TableCell>
                {canManageDepartments && (
                  <TableCell align="right">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleOpenDialog(department)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => openDeleteDialog(department)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Department Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          {editingDepartment ? 'Edit Department' : 'Add Department'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Department Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingDepartment ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete department {departmentToDelete?.name}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default DepartmentList
