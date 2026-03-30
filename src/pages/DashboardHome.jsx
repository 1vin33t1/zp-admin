import { Link, useNavigate } from 'react-router-dom'
import './DashboardHome.css'
import TopBar from '../components/TopBar'

const DashboardHome = ({ userEmail, onLogout }) => {
  const navigate = useNavigate()

  const menuItems = [
    {
      id: 1,
      title: 'View Staff',
      description: 'View all staff members',
      icon: '👥',
      path: '/staff/view',
    },
    {
      id: 2,
      title: 'Add Staff',
      description: 'Add new staff member',
      icon: '➕',
      path: '/staff/add',
    },
    {
      id: 3,
      title: 'View Admins',
      description: 'View all admins',
      icon: '🔐',
      path: '/admin/view',
    },
    {
      id: 4,
      title: 'Add Admin',
      description: 'Add new admin',
      icon: '👤',
      path: '/admin/add',
    },
  ]

  return (
    <div className="dashboard-container">
      <TopBar userEmail={userEmail} onLogout={onLogout} isLoggedIn={true} />
      <div className="dashboard-content">
        <div className="dashboard-heading">Dashboard</div>
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
