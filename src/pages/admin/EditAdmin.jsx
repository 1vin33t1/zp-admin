import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './EditAdmin.css'
import TopBar from '../../components/TopBar'
import { useLanguage } from '../../context/LanguageContext'
import { t } from '../../utils/translations'
import { createAxiosInstance } from '../../utils/apiUtils'
import { ROUTES } from '../../config/appConfig'

const EditAdmin = ({ userEmail, onLogout }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { language, getLanguageCode } = useLanguage()
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
      setError(t('noAdminDataProvided', language))
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
      setError(t('nameCannotBeEmpty', language))
      return
    }

    setError('')
    setShowConfirmModal(true)
  }

  const handleConfirmUpdate = async () => {
    setShowConfirmModal(false)
    setIsSubmitting(true)

    try {
      const apiInstance = createAxiosInstance(getLanguageCode())
      const response = await apiInstance.put(
        '/auth/staff',
        {
          email: originalEmail,
          role: 'ZP_ADMIN',
          name: name,
        }
      )

      if (response.data.success) {
        setShowSuccessModal(true)
        setTimeout(() => {
          navigate(ROUTES.adminView)
        }, 2000)
      } else {
        setError(response.data.failureReason || t('adminUpdateFailure', language))
      }
    } catch (err) {
      setError(err.response?.data?.failureReason || t('adminUpdateFailure', language))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <TopBar userEmail={userEmail} onLogout={onLogout} isLoggedIn={true} />
        <div className="page-content">
          <div style={{ textAlign: 'center', padding: '48px' }}>{t('loading', language)}</div>
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
          <button onClick={() => navigate(ROUTES.adminView)} className="btn-back-error">
            {t('goBackToAdminList', language)}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <TopBar userEmail={userEmail} onLogout={onLogout} isLoggedIn={true} />
      <div className="page-content">
        <button onClick={() => navigate(ROUTES.adminView)} className="back-button">
          ← {t('goBackToAdminList', language)}
        </button>

        <div className="page-heading">{t('editAdmin', language)}</div>

        {error && <div className="error-message">{error}</div>}

        <div className="edit-form-container">
          <div className="form-section">
            <div className="form-group">
              <label className="form-label">{t('emailAddress', language)}</label>
              <input
                type="email"
                value={email}
                disabled
                className="form-input form-input-disabled"
                placeholder={t('emailCannotBeEdited', language)}
              />
              <div className="form-hint">{t('emailAddressCannotBeChanged', language)}</div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('name', language)}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                placeholder={t('enterAdminName', language)}
              />
            </div>
          </div>

          <div className="button-group">
            <button
              onClick={() => navigate(ROUTES.adminView)}
              className="btn-cancel"
            >
              {t('goBackToAdminList', language)}
            </button>
            <button
              onClick={handleUpdateClick}
              className="btn-update"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('updating', language) : t('updateAdmin', language)}
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Update Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">{t('confirmUpdate', language)}</div>
            <div className="modal-body">
              <p>{t('areYouSureUpdateAdmin', language)}</p>
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
                onClick={handleConfirmUpdate}
              >
                {t('yesUpdateAdmin', language)}
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
            <div className="modal-header">{t('successfullyUpdated', language)}</div>
            <div className="modal-body">
              <p>{t('adminUpdatedSuccessfully', language)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EditAdmin
