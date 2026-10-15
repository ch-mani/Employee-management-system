import { createContext, useContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token)
        // Check if token is expired
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          console.warn('Token expired, clearing session')
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
          setLoading(false)
          return
        }
        setUser({
          userId: decoded.sub,
          email: decoded.email || decoded.sub,
          role: decoded.role
        })
      } catch (error) {
        console.error('Invalid token:', error)
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      }
    }
    setLoading(false)
  }, [token])

  const login = (newToken) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const isAuthenticated = !!token && !!user

  const hasRole = (roles) => {
    if (!user) return false
    if (Array.isArray(roles)) {
      return roles.includes(user.role)
    }
    return user.role === roles
  }

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    logout,
    hasRole
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
