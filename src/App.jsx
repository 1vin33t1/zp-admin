import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkAuthStatus()
    }, [])

    const checkAuthStatus = async () => {
        try {
            const response = await axios.get('https://api.pranvidyatech.in/auth/status/admin', {
                withCredentials: true,
            })
            setIsAuthenticated(response.data.status === true)
        } catch (error) {
            setIsAuthenticated(false)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="loading">Loading...</div>
    }

    return (
        <Routes>
            <Route path="/zp-admin" element={<LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />} />
            <Route
                path="/zp-admin/dashboard"
                element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to="/zp-admin" replace />} />
        </Routes>
    )
}

export default App