import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import './EditStaff.css'
import TopBar from '../../components/TopBar'

const EditStaff = ({ userEmail, onLogout }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [regions, setRegions] = useState([])
  const [selectedRegions, setSelectedRegions] = useState([])
  const [originalEmail, setOriginalEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get staff data from location state
  const staffData = location.state?.staff

  useEffect(() => {
    if (!staffData) {
      setError('No staff data provided')
      setLoading(false)
      return
    }

    setName(staffData.name)
    setEmail(staffData.email)
    setOriginalEmail(staffData.email)
    setSelectedRegions(staffData.region || [])

    fetchRegions()
  }, [staffData])

  const fetchRegions = async () => {
    try {
      const response = await axios.get(
        'https://api.pranvidyatech.in/auth/all/region?type=applicant',
        { withCredentials: true }
      )
      setRegions(response.data.region || [])
    } catch (err) {
      console.error('Failed to fetch regions:', err)
      setError('Failed to fetch regions')
    } finally {
      setLoading(false)
    }
  }

  const handleRegionToggle = (region) => {
    setSelectedRegions((prev) =>
      prev.includes(region)
        ? prev.filter((r) => r !== region)
        : [...prev, region]
    )
  }

  const handleUpdateClick = () => {
    if (!name.trim()) {
      setError('Name cannot be empty')
      return
    }

    if (selectedRegions.length === 0) {
      setError('Please select at least one region')
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
          role: 'ZP_STAFF',
          region: selectedRegions,
          name: name,
        },
        { withCredentials: true }
      )

      if (response.data.success) {
        setShowSuccessModal(true)
        setTimeout(() => {
          navigate('/staff/view')
        }, 2000)
      } else {
        setError(response.data.failureReason || 'Failed to update staff')
      }
    } catch (err) {
      setError(err.response?.data?.failureReason || 'Failed to update staff')
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

  if (error && !staffData) {
    return (
      <div className="page-container">
        <TopBar userEmail={userEmail} onLogout={onLogout} isLoggedIn={true} />
        <div className="page-content">
          <div className="error-message">{error}</div>
          <button onClick={() => navigate('/staff/view')} className="btn-back-error">
            Go Back to Staff List
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <TopBar userEmail={userEmail} onLogout={onLogout} isLoggedIn={true} />
      <div className="page-content">
        <button onClick={() => navigate('/staff/view')} className="back-button">
          ← Back to Staff List
        </button>

        <div className="page-heading">Edit Staff</div>

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
                placeholder="Enter staff name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Regions</label>
              <div className="region-grid">
                {regions.map((region) => (
                  <div key={region} className="region-checkbox-item">
                    <input
                      type="checkbox"
                      id={`region-${region}`}
                      checked={selectedRegions.includes(region)}
                      onChange={() => handleRegionToggle(region)}
                      className="region-checkbox"
                    />
                    <label htmlFor={`region-${region}`} className="region-label">
                      {region}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="button-group">
            <button
              onClick={() => navigate('/staff/view')}
              className="btn-cancel"
            >
              Back to List
            </button>
            <button
              onClick={handleUpdateClick}
              className="btn-update"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Staff'}
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
              <p>Are you sure you want to update this staff member?</p>
              <div className="modal-details">
                <p>
                  <strong>Email:</strong> {email}
                </p>
                <p>
                  <strong>Name:</strong> {name}
                </p>
                <p>
                  <strong>Regions:</strong> {selectedRegions.join(', ')}
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
              <p>Staff member has been updated successfully!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EditStaff
