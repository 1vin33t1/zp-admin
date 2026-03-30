import { useNavigate } from 'react-router-dom'
import './ActivityStream.css'
import TopBar from '../components/TopBar'
import { useLanguage } from '../context/LanguageContext'
import { t } from '../utils/translations'
import { ROUTES } from '../config/appConfig'

const ActivityStream = ({ userEmail, onLogout }) => {
  const navigate = useNavigate()
  const { language } = useLanguage()

  return (
    <div className="page-container">
      <TopBar userEmail={userEmail} onLogout={onLogout} isLoggedIn={true} />
      <div className="page-content">
        <button onClick={() => navigate(ROUTES.dashboard)} className="back-button">
          ← {t('backToDashboard', language)}
        </button>

        <div className="page-heading">{t('activityStream', language)}</div>

        <div className="content-box">
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <div className="empty-state-text">{t('activityStream', language)}</div>
            <div className="empty-state-description">
              {t('systemActivityLogs', language)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActivityStream
