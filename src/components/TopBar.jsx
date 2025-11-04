import { useNavigate } from 'react-router-dom'
import './TopBar.css'
import { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { t } from '../utils/translations'

const TopBar = ({ userEmail, onLogout, isLoggedIn }) => {
  const [remainingTime, setRemainingTime] = useState('15:00')
  const navigate = useNavigate()
  const { language, setLanguage } = useLanguage()

  useEffect(() => {
    if (!isLoggedIn) return

    const INACTIVITY_TIMEOUT = 15 * 60
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

  const handleBrandClick = () => {
    navigate('/dashboard')
  }

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <div
          className="top-bar-brand"
          onClick={handleBrandClick}
          style={{ cursor: 'pointer' }}
        >
          ग्राम समृद्धि
        </div>
        {isLoggedIn && (
          <button
            onClick={handleBrandClick}
            className="dashboard-nav-link"
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            {t('dashboard', language)}
          </button>
        )}
      </div>

      {isLoggedIn && (
        <div className="top-bar-right">
          <div className="language-selector">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="language-dropdown"
              title="Select Language"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="mr">मराठी</option>
            </select>
          </div>

          <div className="activity-timer">
            {t('sessionTimeout', language)} {remainingTime}
          </div>
          <div className="user-info">
            <div className="user-email">{userEmail}</div>
            <button className="logout-btn" onClick={handleLogout}>
              {t('logout', language)}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TopBar
