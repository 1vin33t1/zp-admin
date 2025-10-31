import { useState, useEffect } from 'react'
import './TopBar.css'

const TopBar = ({ userEmail, onLogout, isLoggedIn }) => {
    const [remainingTime, setRemainingTime] = useState('15:00')

    useEffect(() => {
        if (!isLoggedIn) return

        const INACTIVITY_TIMEOUT = 15 * 60 // 15 minutes in seconds
        let timeRemaining = INACTIVITY_TIMEOUT

        const interval = setInterval(() => {
            timeRemaining--

            if (timeRemaining <= 0) {
                clearInterval(interval)
                setRemainingTime('0:00')
                return
            }

            const minutes = Math.floor(timeRemaining / 60)
            const seconds = timeRemaining % 60
            setRemainingTime(`${minutes}:${seconds.toString().padStart(2, '0')}`)
        }, 1000)

        return () => clearInterval(interval)
    }, [isLoggedIn])

    const handleLogout = async () => {
        await onLogout()
    }

    return (
        <div className="top-bar">
            <div className="top-bar-left">
                <div className="top-bar-brand">ग्राम समृद्धि</div>
            </div>

            {isLoggedIn && (
                <div className="top-bar-right">
                    <div className="activity-timer">
                        Session timeout: {remainingTime}
                    </div>
                    <div className="user-info">
                        <div className="user-email">{userEmail}</div>
                        <button className="logout-btn" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TopBar
