import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import LoginPage from './pages/LoginPage'
import DashboardHome from './pages/DashboardHome'
import ViewStaff from './pages/staff/ViewStaff'
import AddStaff from './pages/staff/AddStaff'
import EditStaff from './pages/staff/EditStaff'
import ViewAdmin from './pages/admin/ViewAdmin'
import AddAdmin from './pages/admin/AddAdmin'
import EditAdmin from './pages/admin/EditAdmin'
import AddRegion from './pages/region/AddRegion'
import ActivityStream from './pages/ActivityStream'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [userEmail, setUserEmail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('https://api.pranvidyatech.in/auth/status/admin', {
        withCredentials: true,
      })
      if (response.data.status === true) {
        setIsAuthenticated(true)
        setUserEmail(response.data.email || null)
      } else {
        setIsAuthenticated(false)
      }
    } catch (error) {
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await axios.post('https://api.pranvidyatech.in/auth/logout/zp-admin', {}, {
        withCredentials: true,
      })
    } catch (error) {
      console.log('Logout error:', error)
    } finally {
      setIsAuthenticated(false)
      setUserEmail(null)
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <Routes>
      {/* Login Route */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage onLoginSuccess={() => checkAuthStatus()} />
          )
        } 
      />

      {/* Dashboard Route */}
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <DashboardHome userEmail={userEmail} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Staff Routes */}
      <Route
        path="/staff/view"
        element={
          isAuthenticated ? (
            <ViewStaff userEmail={userEmail} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/staff/add"
        element={
          isAuthenticated ? (
            <AddStaff userEmail={userEmail} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/staff/edit"
        element={
          isAuthenticated ? (
            <EditStaff userEmail={userEmail} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/view"
        element={
          isAuthenticated ? (
            <ViewAdmin userEmail={userEmail} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/admin/add"
        element={
          isAuthenticated ? (
            <AddAdmin userEmail={userEmail} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/admin/edit"
        element={
          isAuthenticated ? (
            <EditAdmin userEmail={userEmail} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Region Routes */}
      <Route
        path="/region/add"
        element={
          isAuthenticated ? (
            <AddRegion userEmail={userEmail} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Activity Route */}
      <Route
        path="/activity"
        element={
          isAuthenticated ? (
            <ActivityStream userEmail={userEmail} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
