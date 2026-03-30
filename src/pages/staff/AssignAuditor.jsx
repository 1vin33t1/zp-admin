import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import './AssignAuditor.css'
import TopBar from '../../components/TopBar'
import { useLanguage } from '../../context/LanguageContext'
import { t } from '../../utils/translations'
import { createAxiosInstance } from '../../utils/apiUtils'
import {
  getZpAdminAccessToken,
  initializeZpAdminJwtFlow,
} from '../../utils/zpAdminJwt'

const ITEMS_PER_PAGE = 10

const AssignAuditor = ({ userEmail, onLogout }) => {
  const navigate = useNavigate()
  const { applicationId } = useParams()
  const location = useLocation()
  const { language, getLanguageCode } = useLanguage()
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedAuditors, setSelectedAuditors] = useState([])
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const applicationName = location.state?.application?.applicationName

  useEffect(() => {
    let isMounted = true

    const fetchStaff = async () => {
      setLoading(true)
      setError('')

      try {
        await initializeZpAdminJwtFlow()
        const apiInstance = createAxiosInstance(getLanguageCode())
        const response = await apiInstance.get(
          'https://api.gramsamruddhi.in/auth/all/staff?role=ZP_STAFF'
        )

        if (isMounted) {
          setStaff(response.data?.staff || [])
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.failureReason || t('staffListError', language))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchStaff()

    return () => {
      isMounted = false
    }
  }, [language])

  const totalPages = Math.max(1, Math.ceil(staff.length / ITEMS_PER_PAGE))

  const paginatedStaff = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return staff.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [currentPage, staff])

  const handleAuditorToggle = (email) => {
    setSelectedAuditors((prev) =>
      prev.includes(email) ? prev.filter((item) => item !== email) : [...prev, email]
    )
  }

  const handleAssignAuditor = async () => {
    if (selectedAuditors.length === 0) {
      setError(t('selectAtLeastOneAuditor', language))
      return
    }

    setAssigning(true)
    setError('')

    try {
      const accessToken = await getZpAdminAccessToken()
      const response = await fetch(
        `https://api.gramsamruddhi.in/zp-staff/${applicationId}/assign-auditor`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/plain, */*',
            'Accept-Language': language,
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: 'include',
          body: JSON.stringify({
            auditor: selectedAuditors,
          }),
        }
      )

      const data = await response.json().catch(() => null)

      if (!response.ok || data?.result === false) {
        throw new Error(data?.failureReason || data?.message || t('assignAuditorFailure', language))
      }

      setShowSuccessModal(true)
      setTimeout(() => {
        navigate('/staff/applications')
      }, 3000)
    } catch (err) {
      setError(err.message || t('assignAuditorFailure', language))
    } finally {
      setAssigning(false)
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

  return (
    <div className="page-container">
      <TopBar userEmail={userEmail} onLogout={onLogout} isLoggedIn={true} />
      <div className="page-content">
        <button onClick={() => navigate(-1)} className="back-button">
          ← {t('back', language)}
        </button>

        <div className="page-heading">{t('assignAuditor', language)}</div>

        <div className="assign-auditor-subtitle">
          {applicationName || `${t('applicationId', language)}: ${applicationId}`}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="table-container assign-auditor-table-wrap">
          <table className="staff-table">
            <thead>
              <tr>
                <th>{t('sNo', language)}</th>
                <th>{t('name', language)}</th>
                <th>{t('email', language)}</th>
                <th>{t('postedTaluka', language)}</th>
                <th>{t('assign', language)}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStaff.length > 0 ? (
                paginatedStaff.map((staffMember, index) => {
                  const serialNumber = (currentPage - 1) * ITEMS_PER_PAGE + index + 1
                  const isChecked = selectedAuditors.includes(staffMember.email)

                  return (
                    <tr key={staffMember.email}>
                      <td>{serialNumber}</td>
                      <td>{staffMember.name || '-'}</td>
                      <td>{staffMember.email}</td>
                      <td>{staffMember.postedTaluka || '-'}</td>
                      <td>
                        <label className="assign-checkbox-wrap">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleAuditorToggle(staffMember.email)}
                            className="assign-checkbox"
                          />
                          <span>{isChecked ? t('selected', language) : t('select', language)}</span>
                        </label>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="5" className="empty-cell">
                    {t('noStaffFound', language)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {staff.length > 0 && (
          <div className="pagination-section">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              {t('previous', language)}
            </button>
            <span className="pagination-info">
              {t('page', language)} {currentPage} {t('of', language)} {totalPages}
            </span>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              {t('next', language)}
            </button>
          </div>
        )}

        <div className="assign-actions-bar">
          <button className="assign-page-btn assign-page-btn-secondary" onClick={() => navigate(-1)}>
            {t('back', language)}
          </button>
          <button
            className="assign-page-btn assign-page-btn-primary"
            onClick={handleAssignAuditor}
            disabled={assigning || selectedAuditors.length === 0}
          >
            {assigning ? t('assigning', language) : t('assignAuditor', language)}
          </button>
        </div>
      </div>

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-success">
            <div className="success-icon">✓</div>
            <div className="modal-header">{t('success', language)}</div>
            <div className="modal-body">
              <p>{t('assignAuditorSuccess', language)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AssignAuditor
