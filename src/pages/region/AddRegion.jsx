import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'
import './AddRegion.css'
import TopBar from '../../components/TopBar'

const AddRegion = ({ userEmail, onLogout }) => {
  const navigate = useNavigate()
  const [regionName, setRegionName] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const validateForm = () => {
    if (!regionName.trim()) {
      setError('Taluka name is required')
      return false
    }

    if (regionName.trim().length < 3) {
      setError('Taluka name must be at least 3 characters long')
      return false
    }

    return true
  }

  const handleAddRegionClick = () => {
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
        'https://api.gramsamruddhi.in/auth/region',
        {
          type: 'applicant',
          regionName: regionName.trim(),
        },
        { withCredentials: true }
      )

      if (response.data.success) {
        // Redirect to dashboard
        navigate('/dashboard')
      } else {
        setError(response.data.failureReason || 'Failed to add Taluka')
      }
    } catch (err) {
      setError(err.response?.data?.failureReason || 'Failed to add Taluka')
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

        <div className="page-heading">Add Taluka</div>

        {error && <div className="error-message">{error}</div>}

        <div className="add-form-container">
          <div className="form-section">
            <div className="form-group">
              <label className="form-label">Taluka Name *</label>
              <input
                type="text"
                value={regionName}
                onChange={(e) => {
                  setRegionName(e.target.value)
                  setError('')
                }}
                className="form-input"
                placeholder="Enter Taluka Name (minimum 3 characters)"
                disabled={isSubmitting}
              />
              <div className="form-hint">
                Minimum 3 characters required
              </div>
            </div>
          </div>

          <div className="button-group">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-cancel"
              disabled={isSubmitting}
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleAddRegionClick}
              className="btn-add"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Taluka'}
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Add Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">Confirm Add Taluka</div>
            <div className="modal-body">
              <p>You are about to add taluka:</p>
              <div className="modal-details">
                <p className="region-name-display">{regionName}</p>
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
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddRegion
