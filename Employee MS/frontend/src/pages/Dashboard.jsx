import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { employeeService } from '../services/employeeService'
import { departmentService } from '../services/departmentService'
import { taskService } from '../services/taskService'
import { 
  Typography, 
  Grid, 
  Paper, 
  Box, 
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Chip,
  Divider,
  Button,
  Alert
} from '@mui/material'
import { 
  People as PeopleIcon, 
  Business as BusinessIcon,
  Assignment as TaskIcon,
  AccessTime as TimeIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  History as HistoryIcon
} from '@mui/icons-material'

// Task templates by department
const taskTemplates = {
  IT: [
    'Review and respond to IT support tickets',
    'Update project documentation',
    'Attend daily standup meeting',
    'Code review for pending pull requests',
    'Check system monitoring dashboards',
    'Update task progress in project board',
    'Test recent deployments in staging',
    'Backup critical configuration files',
  ],
  HR: [
    'Review pending leave applications',
    'Follow up on new hire onboarding',
    'Update employee attendance records',
    'Prepare interview schedule for the week',
    'Review and update job postings',
    'Send policy update reminders',
    'Process pending reimbursement requests',
    'Organize team-building activity planning',
  ],
  Finance: [
    'Review daily expense reports',
    'Reconcile bank statements',
    'Process pending invoices',
    'Update budget tracking sheet',
    'Prepare financial summary for review',
    'Follow up on overdue payments',
    'Verify employee reimbursement claims',
    'Audit petty cash records',
  ],
  Marketing: [
    'Review social media analytics',
    'Draft content for upcoming campaigns',
    'Attend marketing standup meeting',
    'Update campaign performance report',
    'Review competitor activity updates',
    'Coordinate with design team on creatives',
    'Plan email newsletter content',
    'Research trending industry keywords',
  ],
  Operations: [
    'Review daily operations checklist',
    'Monitor supply chain status',
    'Coordinate with logistics team',
    'Update inventory tracking records',
    'Attend operations sync meeting',
    'Review vendor delivery schedules',
    'Inspect quality control reports',
    'Document process improvement ideas',
  ],
}

const defaultTasks = [
  'Check and respond to emails',
  'Review daily schedule and priorities',
  'Attend team meeting',
  'Update task progress report',
  'Submit daily work summary',
]

// Generate deterministic "random" tasks for today based on date + department
function getDailyTasks(department, designation) {
  const today = new Date()
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  
  const deptTasks = taskTemplates[department] || defaultTasks
  
  // Pick 5 tasks using seed-based shuffle
  const shuffled = [...deptTasks]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (seed * (i + 1) * 31) % (i + 1)
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  return shuffled.slice(0, 5).map((task, idx) => ({
    id: idx + 1,
    text: task,
    priority: idx === 0 ? 'High' : idx < 3 ? 'Medium' : 'Low',
  }))
}

function Dashboard() {
  const { user } = useAuth()
  const location = useLocation()
  const [stats, setStats] = useState({ employees: 0, departments: 0 })
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [tasks, setTasks] = useState([])
  const [checkedTasks, setCheckedTasks] = useState({})
  const [submittedToday, setSubmittedToday] = useState(false)
  const [todaySubmission, setTodaySubmission] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [taskHistory, setTaskHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role === 'ADMIN' || user?.role === 'HR') {
          const [employees, departments] = await Promise.all([
            employeeService.getAll(),
            departmentService.getAll()
          ])
          setStats({
            employees: employees.length,
            departments: departments.length
          })
        }

        if (user?.role === 'EMPLOYEE') {
          try {
            const emp = await employeeService.getCurrentEmployee()
            setProfile(emp)
            setTasks(getDailyTasks(emp.departmentName, emp.designation))
            
            // Check if already submitted today
            try {
              const todaySub = await taskService.getTodaySubmission()
              if (todaySub) {
                setSubmittedToday(true)
                setTodaySubmission(todaySub)
                // Pre-check the tasks that were submitted
                const checked = {}
                todaySub.completedTasks?.forEach((_, idx) => {
                  checked[idx + 1] = true
                })
                setCheckedTasks(checked)
              }
            } catch {
              // 204 No Content = not submitted yet
            }
          } catch {
            setTasks(getDailyTasks(null, null))
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const toggleTask = (taskId) => {
    if (submittedToday) return // Don't allow changes after submission
    setCheckedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }))
  }

  const handleSubmitTasks = async () => {
    const completed = tasks
      .filter(t => checkedTasks[t.id])
      .map(t => t.text)
    
    if (completed.length === 0) {
      setSubmitMessage('Please complete at least one task before submitting.')
      return
    }

    setSubmitting(true)
    setSubmitMessage('')
    try {
      await taskService.submitTasks(completed, tasks.length)
      setSubmittedToday(true)
      setSubmitMessage('Tasks submitted successfully!')
    } catch (err) {
      setSubmitMessage(err.response?.data?.message || 'Failed to submit tasks')
    } finally {
      setSubmitting(false)
    }
  }

  const loadHistory = async () => {
    if (showHistory) {
      setShowHistory(false)
      return
    }
    try {
      const history = await taskService.getHistory()
      setTaskHistory(history)
      setShowHistory(true)
    } catch {
      console.error('Failed to load task history')
    }
  }

  const completedCount = Object.values(checkedTasks).filter(Boolean).length

  const StatCard = ({ title, value, icon }) => (
    <Paper sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
      <Box sx={{ mr: 2, color: 'primary.main' }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="h6" color="textSecondary">
          {title}
        </Typography>
        <Typography variant="h4">
          {value}
        </Typography>
      </Box>
    </Paper>
  )

  const priorityColor = (priority) => {
    if (priority === 'High') return 'error'
    if (priority === 'Medium') return 'warning'
    return 'default'
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
      {location.state?.roleRequest && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Your {location.state.roleRequest} role request has been submitted. You have Employee access until an Admin reviews it.
        </Alert>
      )}
      <Typography variant="h4" gutterBottom>
        {user?.role === 'EMPLOYEE' 
          ? `Welcome, ${profile?.name || 'Employee'}!`
          : `Welcome, ${user?.role}!`
        }
      </Typography>

      {/* Admin / HR Dashboard */}
      {(user?.role === 'ADMIN' || user?.role === 'HR') && (
        <>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            Here is an overview of your employee management system.
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6}>
              <StatCard 
                title="Total Employees" 
                value={stats.employees} 
                icon={<PeopleIcon sx={{ fontSize: 40 }} />} 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StatCard 
                title="Total Departments" 
                value={stats.departments} 
                icon={<BusinessIcon sx={{ fontSize: 40 }} />} 
              />
            </Grid>
          </Grid>
        </>
      )}

      {/* Employee Dashboard */}
      {user?.role === 'EMPLOYEE' && (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Profile summary card */}
          {profile && (
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  My Info
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Department</Typography>
                    <Typography variant="body1" fontWeight={500}>{profile.departmentName}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Designation</Typography>
                    <Typography variant="body1" fontWeight={500}>{profile.designation}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Employee Code</Typography>
                    <Typography variant="body1" fontWeight={500}>{profile.empCode}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Status</Typography>
                    <Box>
                      <Chip 
                        label={profile.status} 
                        color={profile.status === 'ACTIVE' ? 'success' : 'default'} 
                        size="small" 
                      />
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Daily tasks */}
          <Grid item xs={12} md={profile ? 8 : 12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TaskIcon color="primary" />
                  <Typography variant="h6">Today's Tasks</Typography>
                </Box>
                <Chip 
                  label={`${completedCount}/${tasks.length} done`}
                  color={completedCount === tasks.length && tasks.length > 0 ? 'success' : 'default'}
                  size="small"
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TimeIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  {profile?.departmentName && ` • ${profile.departmentName} Department`}
                </Typography>
              </Box>
              <Divider />
              <List>
                {tasks.map((task) => (
                  <ListItem
                    key={task.id}
                    dense
                    sx={{
                      opacity: checkedTasks[task.id] ? 0.6 : 1,
                      textDecoration: checkedTasks[task.id] ? 'line-through' : 'none',
                    }}
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={!!checkedTasks[task.id]}
                        onChange={() => toggleTask(task.id)}
                        disabled={submittedToday}
                      />
                    </ListItemIcon>
                    <ListItemText primary={task.text} />
                    <Chip label={task.priority} color={priorityColor(task.priority)} size="small" variant="outlined" />
                  </ListItem>
                ))}
              </List>

              {submitMessage && (
                <Alert severity={submittedToday ? 'success' : 'warning'} sx={{ mt: 1, mb: 1 }}>
                  {submitMessage}
                </Alert>
              )}

              {/* Submit button */}
              <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                {!submittedToday ? (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                    onClick={handleSubmitTasks}
                    disabled={submitting || completedCount === 0}
                  >
                    Submit Today's Tasks
                  </Button>
                ) : (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Tasks submitted for today"
                    color="success"
                    variant="outlined"
                  />
                )}
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<HistoryIcon />}
                  onClick={loadHistory}
                >
                  {showHistory ? 'Hide History' : 'View History'}
                </Button>
              </Box>

              {completedCount === tasks.length && tasks.length > 0 && !submittedToday && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="body1" sx={{ color: 'success.contrastText', fontWeight: 500 }}>
                    All tasks completed! Click "Submit Today's Tasks" to record your progress.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Task History */}
          {showHistory && taskHistory.length > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <HistoryIcon color="primary" />
                  <Typography variant="h6">Task Submission History</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                {taskHistory.map((entry) => (
                  <Box key={entry.id} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {new Date(entry.submissionDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                      </Typography>
                      <Chip 
                        label={`${entry.completedCount}/${entry.totalTasks} tasks`} 
                        size="small" 
                        color={entry.completedCount === entry.totalTasks ? 'success' : 'default'}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {entry.completedTasks?.map((task, idx) => (
                        <Chip key={idx} label={task} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  )
}

export default Dashboard
