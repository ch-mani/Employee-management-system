import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Divider
} from '@mui/material'
import { 
  Dashboard as DashboardIcon, 
  People as PeopleIcon, 
  Business as BusinessIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  VerifiedUser as RoleRequestsIcon
} from '@mui/icons-material'

const drawerWidth = 240

const allMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
  { text: 'Employees', icon: <PeopleIcon />, path: '/employees', roles: ['ADMIN', 'HR'] },
  { text: 'Departments', icon: <BusinessIcon />, path: '/departments', roles: ['ADMIN', 'HR'] },
  { text: 'My Profile', icon: <PersonIcon />, path: '/my-profile', roles: ['EMPLOYEE'] },
  { text: 'Role Requests', icon: <RoleRequestsIcon />, path: '/role-requests', roles: ['ADMIN'] },
]

function MainLayout() {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Employee Management System
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {user?.email} ({user?.role})
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {allMenuItems
              .filter(item => item.roles.includes(user?.role))
              .map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton 
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
        </Box>
      </Drawer>
      
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  )
}

export default MainLayout
