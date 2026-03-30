import { useNavigate } from 'react-router-dom'
import './DashboardHome.css'
import TopBar from '../components/TopBar'
import { useLanguage } from '../context/LanguageContext'
import { t } from '../utils/translations'
import { ROUTES } from '../config/appConfig'

const DashboardHome = ({ userEmail, onLogout }) => {
  const navigate = useNavigate()
  const { language } = useLanguage()

  const menuItems = [
    {
      id: 1,
      title: t('viewStaff', language),
      description: t('viewAllStaffMembers', language),
      icon: '👥',
      path: ROUTES.staffView,
    },
    {
      id: 2,
      title: t('addStaff', language),
      description: t('addNewStaffMember', language),
      icon: '➕',
      path: ROUTES.staffAdd,
    },
    {
      id: 3,
      title: t('viewApplications', language),
      description: t('viewAndManageApplications', language),
      icon: '🗂️',
      path: ROUTES.staffApplications,
    },
    {
      id: 4,
      title: t('viewAdmins', language),
      description: t('viewAllAdmins', language),
      icon: '🔐',
      path: ROUTES.adminView,
    },
    {
      id: 5,
      title: t('addAdmin', language),
      description: t('addNewAdmin', language),
      icon: '👤',
      path: ROUTES.adminAdd,
    },
    {
      id: 6,
      title: t('addRegion', language),
      description: t('addNewRegion', language),
      icon: '📍',
      path: ROUTES.regionAdd,
    },
    {
      id: 7,
      title: t('activityStream', language),
      description: t('viewSystemActivityLogs', language),
      icon: '📊',
      path: ROUTES.activity,
    },
  ]

  return (
    <div className="dashboard-container">
      <TopBar userEmail={userEmail} onLogout={onLogout} isLoggedIn={true} />
      <div className="dashboard-content">
        <div className="dashboard-heading">{t('dashboard', language)}</div>
        <div className="dashboard-grid">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="dashboard-card"
              onClick={() => navigate(item.path)}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-icon">{item.icon}</div>
              <div className="card-title">{item.title}</div>
              <div className="card-description">{item.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardHome
