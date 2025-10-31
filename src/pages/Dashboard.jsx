import './Dashboard.css'
import TopBar from '../components/TopBar'

const Dashboard = ({ userEmail, onLogout }) => {
    return (
        <div className="dashboard-container">
            <TopBar userEmail={userEmail} onLogout={onLogout} isLoggedIn={true} />
            <div className="dashboard-content">
                <div className="dashboard-heading">Welcome to ZP-Admin Dashboard</div>
                <div className="dashboard-text">
                    This is a dummy dashboard. Add your content here.
                </div>
            </div>
        </div>
    )
}

export default Dashboard
