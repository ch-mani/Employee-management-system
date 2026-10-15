import { useEffect, useState } from 'react'
import { authService } from '../services/authService'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'

function RoleRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingUserId, setProcessingUserId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setRequests(await authService.getRoleRequests())
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load role requests.')
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [])

  const handleRequest = async (request, action) => {
    setError('')
    setSuccess('')
    setProcessingUserId(request.userId)
    try {
      if (action === 'approve') {
        await authService.approveRoleRequest(request.userId)
      } else {
        await authService.rejectRoleRequest(request.userId)
      }
      setRequests((current) => current.filter((item) => item.userId !== request.userId))
      setSuccess(action === 'approve'
        ? `${request.requestedRole} access approved. The user must sign in again.`
        : 'Role request rejected.')
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update this role request.')
    } finally {
      setProcessingUserId(null)
    }
  }

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Role Requests</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Approve or reject requests for HR and Admin access.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Requested Role</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">No pending role requests.</TableCell>
              </TableRow>
            ) : requests.map((request) => (
              <TableRow key={request.userId}>
                <TableCell>{request.name}</TableCell>
                <TableCell>{request.email}</TableCell>
                <TableCell>{request.requestedRole}</TableCell>
                <TableCell align="right">
                  <Button
                    variant="contained"
                    size="small"
                    disabled={processingUserId !== null}
                    onClick={() => handleRequest(request, 'approve')}
                    sx={{ mr: 1 }}
                  >
                    {processingUserId === request.userId ? <CircularProgress size={20} /> : 'Approve'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    disabled={processingUserId !== null}
                    onClick={() => handleRequest(request, 'reject')}
                  >
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default RoleRequests
