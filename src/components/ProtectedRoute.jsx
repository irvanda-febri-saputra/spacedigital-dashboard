import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useEffect, useState } from 'react'

export default function ProtectedRoute({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, checkAuth } = useAuthStore()
  const [checked, setChecked] = useState(false)
  
  useEffect(() => {
    // Re-check auth state from localStorage on mount
    checkAuth()
    setChecked(true)
    
    // Listen for auth:logout event from API interceptor
    const handleLogout = () => {
      navigate('/login', { replace: true })
    }
    
    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [navigate])
  
  // Wait until we've checked localStorage
  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]"></div>
      </div>
    )
  }
  
  // Check directly from localStorage as backup
  const token = localStorage.getItem('auth_token')
  
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
