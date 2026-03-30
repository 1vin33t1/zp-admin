import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import DashboardHome from './pages/DashboardHome'
import ViewStaff from './pages/staff/ViewStaff'
import AddStaff from './pages/staff/AddStaff'
import EditStaff from './pages/staff/EditStaff'
import ViewAdmin from './pages/admin/ViewAdmin'
import AddAdmin from './pages/admin/AddAdmin'
import EditAdmin from './pages/admin/EditAdmin'
import ActivityStream from './pages/ActivityStream'
import StaffApplications from './pages/staff/StaffApplications'
import AssignAuditor from './pages/staff/AssignAuditor'
import AddRegion from './pages/region/AddRegion'
import { getApiUrl, ROUTES } from './config/appConfig'
import { stopZpAdminJwtScheduler } from './utils/zpAdminJwt'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [userEmail, setUserEmail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(getApiUrl('/auth/status/admin'), {
        withCredentials: true,
      })
      if (response.data.status === true) {
        setIsAuthenticated(true)
        setUserEmail(response.data.email || null)
      } else {
        setIsAuthenticated(false)
        setUserEmail(null)
      }
    } catch (error) {
      setIsAuthenticated(false)
      setUserEmail(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await axios.post(getApiUrl('/auth/logout/zp-admin'), {}, {
        withCredentials: true,
      })
    } catch (error) {
      console.log('Logout error:', error)
    } finally {
      stopZpAdminJwtScheduler()
      setIsAuthenticated(false)
      setUserEmail(null)
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  const protectedRouteElements = [
    {
      path: ROUTES.dashboard,
      element: <DashboardHome userEmail={userEmail} onLogout={handleLogout} />,
    },
    {
      path: ROUTES.staffView,
      element: <ViewStaff userEmail={userEmail} onLogout={handleLogout} />,
    },
    {
      path: ROUTES.staffAdd,
      element: <AddStaff userEmail={userEmail} onLogout={handleLogout} />,
    },
    {
      path: ROUTES.staffEdit,
      element: <EditStaff userEmail={userEmail} onLogout={handleLogout} />,
    },
    {
      path: ROUTES.staffApplications,
      element: <StaffApplications userEmail={userEmail} onLogout={handleLogout} />,
    },
    {
      path: ROUTES.assignAuditor(),
      element: <AssignAuditor userEmail={userEmail} onLogout={handleLogout} />,
    },
    {
      path: ROUTES.adminView,
      element: <ViewAdmin userEmail={userEmail} onLogout={handleLogout} />,
    },
    {
      path: ROUTES.adminAdd,
      element: <AddAdmin userEmail={userEmail} onLogout={handleLogout} />,
    },
    {
      path: ROUTES.adminEdit,
      element: <EditAdmin userEmail={userEmail} onLogout={handleLogout} />,
    },
    {
      path: ROUTES.regionAdd,
      element: <AddRegion userEmail={userEmail} onLogout={handleLogout} />,
    },
    {
      path: ROUTES.activity,
      element: <ActivityStream userEmail={userEmail} onLogout={handleLogout} />,
    },
  ]

  return (
    <Routes>
      <Route
        path={ROUTES.login}
        element={
          isAuthenticated ? (
            <Navigate to={ROUTES.dashboard} replace />
          ) : (
            <LoginPage onLoginSuccess={checkAuthStatus} />
          )
        }
      />

      <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
        {protectedRouteElements.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.login} replace />} />
    </Routes>
  )
}

export default App
