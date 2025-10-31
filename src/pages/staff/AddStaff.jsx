import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import './AddStaff.css'
import TopBar from '../../components/TopBar'

const AddStaff = ({ userEmail, onLogout }) => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [selectedRegions, setSelectedRegions] = useState([])
  const [regions, setRegions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Email validation regex
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  // Fetch regions on component mount
  useEffect(() => {
    fetchRegions()
  }, [])

  const fetchRegions = async () => {
    try {
      const response = await axios.get(
        'https://api.gramsamruddhi.in/auth/all/region?type=applicant',
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

    if (selectedRegions.length === 0) {
      setError('Please select at least one region')
      return false
    }

    return true
  }

  const handleAddStaffClick = () => {
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
          role: 'ZP_STAFF',
          region: selectedRegions,
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
        setError(response.data.failureReason || 'Failed to add staff')
      }
    } catch (err) {
      setError(err.response?.data?.failureReason || 'Failed to add staff')
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

  return (
    <div className="page-container">
      <TopBar userEmail={userEmail} onLogout={onLogout} isLoggedIn={true} />
      <div className="page-content">
        <button onClick={() => navigate('/dashboard')} className="back-button">
          ← Back to Dashboard
        </button>

        <div className="page-heading">Add Staff</div>

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
                placeholder="Enter staff email"
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
                placeholder="Enter staff name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Regions *</label>
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
              onClick={() => navigate('/dashboard')}
              className="btn-cancel"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleAddStaffClick}
              className="btn-add"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Staff'}
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Add Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">Confirm Add Staff</div>
            <div className="modal-body">
              <p>Are you sure you want to add this staff member?</p>
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
              <p>Staff member has been added successfully!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddStaff
