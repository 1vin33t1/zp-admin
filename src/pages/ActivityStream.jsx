import { useNavigate } from 'react-router-dom'
import './ActivityStream.css'
import TopBar from '../components/TopBar'

const ActivityStream = ({ userEmail, onLogout }) => {
  const navigate = useNavigate()

  return (
    <div className="page-container">
      <TopBar userEmail={userEmail} onLogout={onLogout} isLoggedIn={true} />
      <div className="page-content">
        <button onClick={() => navigate('/dashboard')} className="back-button">
          ← Back to Dashboard
        </button>

        <div className="page-heading">Activity Stream</div>

        <div className="content-box">
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <div className="empty-state-text">Activity Stream</div>
            <div className="empty-state-description">
              System activity logs and monitoring will be displayed here.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActivityStream
