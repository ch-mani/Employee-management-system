import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import EmployeeList from './pages/EmployeeList'
import EmployeeProfile from './pages/EmployeeProfile'
import DepartmentList from './pages/DepartmentList'
import MyProfile from './pages/MyProfile'
import RoleRequests from './pages/RoleRequests'
import MainLayout from './components/MainLayout'

function App() {
  const { isAuthenticated, hasRole } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
      
      <Route path="/" element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="employees" element={<EmployeeList />} />
        <Route path="employees/:id" element={<EmployeeProfile />} />
        <Route path="departments" element={<DepartmentList />} />
        <Route path="my-profile" element={<MyProfile />} />
        <Route path="role-requests" element={hasRole('ADMIN') ? <RoleRequests /> : <Navigate to="/dashboard" />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
