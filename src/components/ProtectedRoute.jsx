import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ isAuthenticated, children }) => {
    if (isAuthenticated === null) {
        return <div className="loading">Loading...</div>
    }

    if (!isAuthenticated) {
        return <Navigate to="/zp-admin" replace />
    }

    return children
}

export default ProtectedRoute