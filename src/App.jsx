import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'

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
            <Route path="/zp-admin" element={
                isAuthenticated ? (
                    <Navigate to="/zp-admin/dashboard" replace />
                ) : (
                    <LoginPage onLoginSuccess={() => checkAuthStatus()} />
                )
            } />
            <Route
                path="/zp-admin/dashboard"
                element={
                    <ProtectedRoute isAuthenticated={isAuthenticated} userEmail={userEmail} onLogout={handleLogout} />
                }
            />
            <Route path="*" element={<Navigate to="/zp-admin" replace />} />
        </Routes>
    )
}

export default App
