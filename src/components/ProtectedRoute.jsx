import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '../config/appConfig'

const ProtectedRoute = ({ isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />
  }

  return <Outlet />
}

export default ProtectedRoute