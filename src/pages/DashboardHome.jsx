import { Link } from 'react-router-dom'
import './DashboardHome.css'
import TopBar from '../components/TopBar'

const DashboardHome = ({ userEmail, onLogout }) => {
    const menuItems = [
        {
            id: 1,
            title: 'View Staff',
            description: 'View all staff members',
            icon: '👥',
            path: '/zp-admin/staff/view',
        },
        {
            id: 2,
            title: 'Add Staff',
            description: 'Add new staff member',
            icon: '➕',
            path: '/zp-admin/staff/add',
        },
        {
            id: 3,
            title: 'Add Region',
            description: 'Add new region',
            icon: '🌍',
            path: '/zp-admin/region/add',
        },
        {
            id: 4,
            title: 'View Admins',
            description: 'View all admins',
            icon: '🔐',
            path: '/zp-admin/admin/view',
        },
        {
            id: 5,
            title: 'Add Admin',
            description: 'Add new admin',
            icon: '👤',
            path: '/zp-admin/admin/add',
        },
    ]

    return (
        <div className="dashboard-container">
            <TopBar userEmail={userEmail} onLogout={onLogout} isLoggedIn={true} />
            <div className="dashboard-content">
                <div className="dashboard-heading">Dashboard</div>
                <div className="dashboard-grid">
                    {menuItems.map((item) => (
                        <Link key={item.id} to={item.path} className="dashboard-card">
                            <div className="card-icon">{item.icon}</div>
                            <div className="card-title">{item.title}</div>
                            <div className="card-description">{item.description}</div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default DashboardHome