import { Link } from 'react-router-dom'
import '../PageTemplate.css'
import TopBar from '../../components/TopBar.jsx'

const AddStaff = ({ userEmail, onLogout }) => {
    return (
        <div className="page-container">
            <TopBar userEmail={userEmail} onLogout={onLogout} isLoggedIn={true} />
            <div className="page-content">
                <Link to="/zp-admin/dashboard" className="back-button">
                    ← Back to Dashboard
                </Link>
                <div className="page-heading">Add Staff</div>
                <div className="content-box">
                    <div className="empty-state">
                        <div className="empty-state-icon">➕</div>
                        <div className="empty-state-text">Add New Staff Member</div>
                        <div className="empty-state-description">
                            Staff addition form will be displayed here.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddStaff