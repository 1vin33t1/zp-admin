import { Link } from 'react-router-dom'
import '../PageTemplate.css'
import TopBar from '../../components/TopBar.jsx'

const EditStaff = ({ userEmail, onLogout }) => {
    return (
        <div className="page-container">
            <TopBar userEmail={userEmail} onLogout={onLogout} isLoggedIn={true} />
            <div className="page-content">
                <Link to="/zp-admin/staff/view" className="back-button">
                    ← Back to Staff List
                </Link>
                <div className="page-heading">Edit Staff</div>
                <div className="content-box">
                    <div className="empty-state">
                        <div className="empty-state-icon">✏️</div>
                        <div className="empty-state-text">Edit Staff Member</div>
                        <div className="empty-state-description">
                            Staff editing form will be displayed here.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditStaff