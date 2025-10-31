import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import './AddAdmin.css'
import TopBar from '../../components/TopBar'

const AddAdmin = ({ userEmail, onLogout }) => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Email validation regex
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validateForm = () => {
    if (!email.trim()) {
      setError('Email is required')
      return false
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return false
    }

    if (!name.trim()) {
      setError('Name is required')
      return false
    }

    return true
  }

  const handleAddAdminClick = () => {
    setError('')

    if (!validateForm()) {
      return
    }

    setShowConfirmModal(true)
  }

  const handleConfirmAdd = async () => {
    setShowConfirmModal(false)
    setIsSubmitting(true)

    try {
      const response = await axios.post(
        'https://api.gramsamruddhi.in/auth/staff',
        {
          email: email,
          role: 'ZP_ADMIN',
          name: name,
        },
        { withCredentials: true }
      )

      if (response.data.success) {
        setShowSuccessModal(true)
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      } else {
        setError(response.data.failureReason || 'Failed to add admin')
      }
    } catch (err) {
      setError(err.response?.data?.failureReason || 'Failed to add admin')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-container">
      <TopBar userEmail={userEmail} onLogout={onLogout} isLoggedIn={true} />
      <div className="page-content">
        <button onClick={() => navigate('/dashboard')} className="back-button">
          ← Back to Dashboard
        </button>

        <div className="page-heading">Add Admin</div>

        {error && <div className="error-message">{error}</div>}

        <div className="add-form-container">
          <div className="form-section">
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                className="form-input"
                placeholder="Enter admin email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError('')
                }}
                className="form-input"
                placeholder="Enter admin name"
              />
            </div>
          </div>

          <div className="button-group">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-cancel"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleAddAdminClick}
              className="btn-add"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Admin'}
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Add Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">Confirm Add Admin</div>
            <div className="modal-body">
              <p>Are you sure you want to add this admin?</p>
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
                onClick={handleConfirmAdd}
              >
                Yes, Add
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
            <div className="modal-header">Successfully Added</div>
            <div className="modal-body">
              <p>Admin has been added successfully!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddAdmin
