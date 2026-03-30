import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './AddRegion.css'
import TopBar from '../../components/TopBar'
import { useLanguage } from '../../context/LanguageContext'
import { t } from '../../utils/translations'
import { createAxiosInstance } from '../../utils/apiUtils'
import { ROUTES } from '../../config/appConfig'

const AddRegion = ({ userEmail, onLogout }) => {
  const navigate = useNavigate()
  const { language, getLanguageCode } = useLanguage()
  const [regionName, setRegionName] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const validateForm = () => {
    if (!regionName.trim()) {
      setError(t('regionNameRequired', language))
      return false
    }

    if (regionName.trim().length < 3) {
      setError(t('minimumThreeCharacters', language))
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
      const apiInstance = createAxiosInstance(getLanguageCode())
      const response = await apiInstance.post(
        '/auth/region',
        {
          type: 'applicant',
          regionName: regionName.trim(),
        }
      )

      if (response.data.success) {
        navigate(ROUTES.dashboard)
      } else {
        setError(response.data.failureReason || t('failedToAddRegion', language))
      }
    } catch (err) {
      setError(err.response?.data?.failureReason || t('failedToAddRegion', language))
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

        <div className="page-heading">{t('addRegion', language)}</div>

        {error && <div className="error-message">{error}</div>}

        <div className="add-form-container">
          <div className="form-section">
            <div className="form-group">
              <label className="form-label">{t('regionName', language)} *</label>
              <input
                type="text"
                value={regionName}
                onChange={(e) => {
                  setRegionName(e.target.value)
                  setError('')
                }}
                className="form-input"
                placeholder={t('regionName', language)}
                disabled={isSubmitting}
              />
              <div className="form-hint">
                {t('minimumCharactersRequired', language)}
              </div>
            </div>
          </div>

          <div className="button-group">
            <button
              onClick={() => navigate(ROUTES.dashboard)}
              className="btn-cancel"
              disabled={isSubmitting}
            >
              {t('backToDashboard', language)}
            </button>
            <button
              onClick={handleAddRegionClick}
              className="btn-add"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('adding', language) : t('addRegionButton', language)}
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Add Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">{t('confirmAddRegion', language)}</div>
            <div className="modal-body">
              <p>{t('youAreAboutToAddRegion', language)}</p>
              <div className="modal-details">
                <p className="region-name-display">{regionName}</p>
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
                {t('yes', language)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddRegion
