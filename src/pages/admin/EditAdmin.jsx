import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import './EditAdmin.css'
import TopBar from '../../components/TopBar'

const EditAdmin = ({ userEmail, onLogout }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [originalEmail, setOriginalEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get admin data from location state
  const adminData = location.state?.admin

  useEffect(() => {
    if (!adminData) {
      setError('No admin data provided')
      setLoading(false)
      return
    }

    setName(adminData.name)
    setEmail(adminData.email)
    setOriginalEmail(adminData.email)
    setLoading(false)
  }, [adminData])

  const handleUpdateClick = () => {
    if (!name.trim()) {
      setError('Name cannot be empty')
      return
    }

    setError('')
    setShowConfirmModal(true)
  }

  const handleConfirmUpdate = async () => {
    setShowConfirmModal(false)
    setIsSubmitting(true)

    try {
      const response = await axios.put(
        'https://api.pranvidyatech.in/auth/staff',
        {
          email: originalEmail,
          role: 'ZP_ADMIN',
          name: name,
        },
        { withCredentials: true }
      )

      if (response.data.success) {
        setShowSuccessModal(true)
        setTimeout(() => {
          navigate('/admin/view')
        }, 2000)
      } else {
        setError(response.data.failureReason || 'Failed to update admin')
      }
    } catch (err) {
      setError(err.response?.data?.failureReason || 'Failed to update admin')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <TopBar userEmail={userEmail} onLogout={onLogout} isLoggedIn={true} />
        <div className="page-content">
          <div style={{ textAlign: 'center', padding: '48px' }}>Loading...</div>
        </div>
      </div>
    )
  }

  if (error && !adminData) {
    return (
      <div className="page-container">
        <TopBar userEmail={userEmail} onLogout={onLogout} isLoggedIn={true} />
        <div className="page-content">
          <div className="error-message">{error}</div>
          <button onClick={() => navigate('/admin/view')} className="btn-back-error">
            Go Back to Admin List
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <TopBar userEmail={userEmail} onLogout={onLogout} isLoggedIn={true} />
      <div className="page-content">
        <button onClick={() => navigate('/admin/view')} className="back-button">
          ← Back to Admin List
        </button>

        <div className="page-heading">Edit Admin</div>

        {error && <div className="error-message">{error}</div>}

        <div className="edit-form-container">
          <div className="form-section">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={email}
                disabled
                className="form-input form-input-disabled"
                placeholder="Email (cannot be edited)"
              />
              <div className="form-hint">Email address cannot be changed</div>
            </div>

            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                placeholder="Enter admin name"
              />
            </div>
          </div>

          <div className="button-group">
            <button
              onClick={() => navigate('/admin/view')}
              className="btn-cancel"
            >
              Back to List
            </button>
            <button
              onClick={handleUpdateClick}
              className="btn-update"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Admin'}
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Update Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">Confirm Update</div>
            <div className="modal-body">
              <p>Are you sure you want to update this admin?</p>
              <div className="modal-details">
                <p>
                  <strong>Email:</strong> {email}
                </p>
                <p>
                  <strong>Name:</strong> {name}
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="modal-btn-cancel"
                onClick={() => setShowConfirmModal(false)}
              >
                Go Back
              </button>
              <button
                className="modal-btn-confirm"
                onClick={handleConfirmUpdate}
              >
                Yes, Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-success">
            <div className="success-icon">✓</div>
            <div className="modal-header">Successfully Updated</div>
            <div className="modal-body">
              <p>Admin has been updated successfully!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EditAdmin
