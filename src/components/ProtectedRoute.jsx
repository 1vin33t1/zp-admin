import { Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

const ProtectedRoute = ({ isAuthenticated, userEmail, onLogout, children }) => {
    const navigate = useNavigate()
    const [inactivityTimer, setInactivityTimer] = useState(null)

    // Activity timer and inactivity logout
    useEffect(() => {
        if (!isAuthenticated) return

        // Activity timer - 15 minutes
        const INACTIVITY_TIMEOUT = 15 * 60 * 1000 // 15 minutes

        const resetTimer = () => {
            if (inactivityTimer) {
                clearTimeout(inactivityTimer)
            }

            const timer = setTimeout(() => {
                performLogout()
            }, INACTIVITY_TIMEOUT)

            setInactivityTimer(timer)
        }

        // Track user activity
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']

        events.forEach((event) => {
            document.addEventListener(event, resetTimer)
        })

        // Initial timer
        resetTimer()

        return () => {
            events.forEach((event) => {
                document.removeEventListener(event, resetTimer)
            })
            if (inactivityTimer) {
                clearTimeout(inactivityTimer)
            }
        }
    }, [isAuthenticated, inactivityTimer])

    // Auto-logout when browser/tab is closed
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.visibilityState === "hidden") {
                try {
                    await fetch('https://api.gramsamruddhi.in/auth/logout/zp-admin', {
                        method: 'POST',
                        credentials: 'include',
                    })
                } catch (error) {
                    console.log('Logout on unload error:', error)
                }
            }
        }

        window.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            window.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [])

    const performLogout = async () => {
        try {
            await onLogout()
            navigate('/zp-admin')
        } catch (error) {
            console.log('Logout error:', error)
            navigate('/zp-admin')
        }
    }

    if (isAuthenticated === null) {
        return <div className="loading">Loading...</div>
    }

    if (!isAuthenticated) {
        return <Navigate to="/zp-admin" replace />
    }

    return children
}

export default ProtectedRoute