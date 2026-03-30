import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './StaffApplications.css'
import TopBar from '../../components/TopBar'
import { useLanguage } from '../../context/LanguageContext'
import { t } from '../../utils/translations'
import { getApiUrl, ROUTES } from '../../config/appConfig'
import {
  getZpAdminAccessToken,
  initializeZpAdminJwtFlow,
} from '../../utils/zpAdminJwt'

const localeMap = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
}

const joinValues = (values) =>
  Array.isArray(values) && values.length > 0 ? values.join(', ') : '-'

const formatDateInIst = (value, language) => {
  if (!value) {
    return '-'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat(localeMap[language] || 'en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const StaffApplications = ({ userEmail, onLogout }) => {
  const navigate = useNavigate()
  const { language, getLanguageCode } = useLanguage()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const fetchApplications = async () => {
      setLoading(true)
      setError('')

      try {
        await initializeZpAdminJwtFlow()
        const accessToken = await getZpAdminAccessToken()
        const response = await fetch(getApiUrl('/zp-application/all'), {
          headers: {
            Accept: 'application/json',
            'Accept-Language': getLanguageCode(),
            Authorization: `Bearer ${accessToken}`,
          }
        })

        const data = await response.json().catch(() => null)

        if (!response.ok || !data?.result) {
          throw new Error(data?.failureReason || data?.message || t('applicationsFetchFailed', language))
        }

        if (isMounted) {
          setApplications(data?.data?.applicationList || [])
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || t('applicationsFetchFailed', language))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchApplications()

    return () => {
      isMounted = false
    }
  }, [language])

  const applicationCards = useMemo(
    () =>
      applications.map((application, index) => ({
        ...application,
        serialNumber: index + 1,
        dateRange: `${formatDateInIst(application.startDate, language)} - ${formatDateInIst(
          application.endDate,
          language
        )}`,
      })),
    [applications, language]
  )

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

  return (
    <div className="page-container">
      <TopBar userEmail={userEmail} onLogout={onLogout} isLoggedIn={true} />
      <div className="page-content">
        <button onClick={() => navigate(ROUTES.dashboard)} className="back-button">
          ← {t('backToDashboard', language)}
        </button>

        <div className="page-heading">{t('viewApplications', language)}</div>

        {error && <div className="error-message">{error}</div>}

        {applicationCards.length === 0 ? (
          <div className="content-box">
            <div className="empty-state">
              <div className="empty-state-icon">🗂️</div>
              <div className="empty-state-text">{t('noApplicationsFound', language)}</div>
              <div className="empty-state-description">
                {t('applicationsEmptyDescription', language)}
              </div>
            </div>
          </div>
        ) : (
          <div className="applications-list">
            {applicationCards.map((application) => (
              <div className="application-card" key={application.id}>
                <div className="application-banner-wrap">
                  {application.bannerImgUrl ? (
                    <img
                      src={application.bannerImgUrl}
                      alt={application.applicationName}
                      className="application-banner"
                    />
                  ) : (
                    <div className="application-banner application-banner-placeholder">
                      {t('bannerUnavailable', language)}
                    </div>
                  )}
                </div>

                <div className="application-details">
                  <div className="application-card-head">
                    <div>
                      <div className="application-serial">
                        {t('applicationLabel', language)} #{application.serialNumber}
                      </div>
                      <h2 className="application-title">{application.applicationName || '-'}</h2>
                    </div>
                    <div
                      className={`status application-status-pill ${
                        application.canEditAuditor ? 'status--success' : 'status--info'
                      }`}
                    >
                      {application.canEditAuditor
                        ? t('auditorAssignmentOpen', language)
                        : t('auditorAssignmentLocked', language)}
                    </div>
                  </div>

                  <div className="application-meta-grid">
                    <div className="application-meta-item">
                      <span className="application-meta-label">{t('taluka', language)}</span>
                      <span className="application-meta-value">{application.taluka || '-'}</span>
                    </div>
                    <div className="application-meta-item">
                      <span className="application-meta-label">{t('gramPanchayat', language)}</span>
                      <span className="application-meta-value">
                        {joinValues(application.gramPanchayatList)}
                      </span>
                    </div>
                    <div className="application-meta-item">
                      <span className="application-meta-label">{t('village', language)}</span>
                      <span className="application-meta-value">
                        {joinValues(application.villageList)}
                      </span>
                    </div>
                    <div className="application-meta-item">
                      <span className="application-meta-label">{t('date', language)}</span>
                      <span className="application-meta-value">{application.dateRange}</span>
                    </div>
                    <div className="application-meta-item application-meta-item-wide">
                      <span className="application-meta-label">{t('assignedAuditors', language)}</span>
                      <span className="application-meta-value">
                        {joinValues(application.auditorList)}
                      </span>
                    </div>
                  </div>

                  <div className="application-actions">
                    <button
                      className="application-btn application-btn-primary"
                      onClick={() =>
                        navigate(ROUTES.assignAuditor(application.id), {
                          state: { application },
                        })
                      }
                      disabled={!application.canEditAuditor}
                    >
                      {t('assignAuditor', language)}
                    </button>
                    <a
                      className="application-btn application-btn-secondary"
                      href={application.descriptionUrl || '#'}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => {
                        if (!application.descriptionUrl) {
                          event.preventDefault()
                        }
                      }}
                    >
                      {t('viewDetails', language)}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default StaffApplications
