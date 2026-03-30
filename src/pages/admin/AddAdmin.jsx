import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './AddAdmin.css'
import TopBar from '../../components/TopBar'
import { useLanguage } from '../../context/LanguageContext'
import { t } from '../../utils/translations'
import { createAxiosInstance } from '../../utils/apiUtils'
import { ROUTES } from '../../config/appConfig'

const AddAdmin = ({ userEmail, onLogout }) => {
  const navigate = useNavigate()
  const { language, getLanguageCode } = useLanguage()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
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
      setError(t('emailRequired', language))
      return false
    }

    if (!validateEmail(email)) {
      setError(t('validEmailRequired', language))
      return false
    }

    if (!name.trim()) {
      setError(t('nameRequired', language))
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
      const apiInstance = createAxiosInstance(getLanguageCode())
      const response = await apiInstance.post(
        '/auth/staff',
        {
          email: email,
          role: 'ZP_ADMIN',
          name: name,
        }
      )

      if (response.data.success) {
        setShowSuccessModal(true)
        setTimeout(() => {
          navigate(ROUTES.dashboard)
        }, 2000)
      } else {
        setError(response.data.failureReason || t('adminAddFailure', language))
      }
    } catch (err) {
      setError(err.response?.data?.failureReason || t('adminAddFailure', language))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-container">
      <TopBar userEmail={userEmail} onLogout={onLogout} isLoggedIn={true} />
      <div className="page-content">
        <button onClick={() => navigate(ROUTES.dashboard)} className="back-button">
          ← {t('backToDashboard', language)}
        </button>

        <div className="page-heading">{t('addAdmin', language)}</div>

        {error && <div className="error-message">{error}</div>}

        <div className="add-form-container">
          <div className="form-section">
            <div className="form-group">
              <label className="form-label">{t('emailAddress', language)} *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                className="form-input"
                placeholder={t('enterAdminEmail', language)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('name', language)} *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError('')
                }}
                className="form-input"
                placeholder={t('enterAdminName', language)}
              />
            </div>
          </div>

          <div className="button-group">
            <button
              onClick={() => navigate(ROUTES.dashboard)}
              className="btn-cancel"
            >
              {t('backToDashboard', language)}
            </button>
            <button
              onClick={handleAddAdminClick}
              className="btn-add"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('adding', language) : t('addAdmin', language)}
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Add Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">{t('confirmAddAdmin', language)}</div>
            <div className="modal-body">
              <p>{t('areYouSureAddAdmin', language)}</p>
              <div className="modal-details">
                <p>
                  <strong>{t('email', language)}:</strong> {email}
                </p>
                <p>
                  <strong>{t('name', language)}:</strong> {name}
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="modal-btn-cancel"
                onClick={() => setShowConfirmModal(false)}
              >
                {t('goBack', language)}
              </button>
              <button
                className="modal-btn-confirm"
                onClick={handleConfirmAdd}
              >
                {t('yesAddAdmin', language)}
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
            <div className="modal-header">{t('successfullyAdded', language)}</div>
            <div className="modal-body">
              <p>{t('adminAddedSuccessfully', language)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddAdmin
