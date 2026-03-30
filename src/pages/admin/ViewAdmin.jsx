import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './ViewAdmin.css'
import TopBar from '../../components/TopBar'
import { useLanguage } from '../../context/LanguageContext'
import { t } from '../../utils/translations'
import { createAxiosInstance } from '../../utils/apiUtils'
import { ROUTES } from '../../config/appConfig'

const ViewAdmin = ({ userEmail, onLogout }) => {
  const navigate = useNavigate()
  const { language, getLanguageCode } = useLanguage()
  const [admins, setAdmins] = useState([])
  const [filteredAdmins, setFilteredAdmins] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  const itemsPerPage = 10

  // Fetch admin data
  useEffect(() => {
    fetchAdmins()
  }, [language])

  // Apply filters and search
  useEffect(() => {
    let result = [...admins]

    // Search by name
    if (searchTerm) {
      result = result.filter((a) =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sort
    if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name))
    } else if (sortBy === 'email-asc') {
      result.sort((a, b) => a.email.localeCompare(b.email))
    } else if (sortBy === 'email-desc') {
      result.sort((a, b) => b.email.localeCompare(a.email))
    }

    setFilteredAdmins(result)
    setCurrentPage(1)
  }, [admins, searchTerm, sortBy])

  const fetchAdmins = async () => {
    setLoading(true)
    setError('')
    try {
      const apiInstance = createAxiosInstance(getLanguageCode())
      const response = await apiInstance.get('/auth/all/staff?role=ZP_ADMIN')
      setAdmins(response.data.staff || [])
    } catch (err) {
      setError(t('adminListError', language))
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (admin) => {
    navigate(ROUTES.adminEdit, { state: { admin } })
  }

  const handleDeleteClick = (admin) => {
    setDeleteTarget(admin)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    try {
      const apiInstance = createAxiosInstance(getLanguageCode())
      const response = await apiInstance.delete(
        '/auth/staff',
        {
          data: {
            email: deleteTarget.email,
            role: 'ZP_ADMIN',
          },
        }
      )

      if (response.data.success) {
        setAdmins((prev) => prev.filter((a) => a.email !== deleteTarget.email))
        setSuccessMessage(`${t('successfullyDeleted', language)} ${deleteTarget.name}`)
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setError(response.data.failureReason || t('adminDeleteFailure', language))
      }
    } catch (err) {
      setError(err.response?.data?.failureReason || t('adminDeleteFailure', language))
    } finally {
      setShowDeleteModal(false)
      setDeleteTarget(null)
    }
  }

  // Check if admin is current user
  const isCurrentUser = (adminEmail) => adminEmail === userEmail

  // Pagination
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const paginatedAdmins = filteredAdmins.slice(startIdx, startIdx + itemsPerPage)

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

        <div className="page-heading">{t('adminList', language)}</div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <div className="controls-section">
          <div className="search-filter-group">
            <div className="search-box">
              <input
                type="text"
                placeholder={t('searchByName', language)}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="sort-box">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="">{t('sortBy', language)}</option>
                <option value="name-asc">{t('nameAZ', language)}</option>
                <option value="name-desc">{t('nameZA', language)}</option>
                <option value="email-asc">{t('emailAZ', language)}</option>
                <option value="email-desc">{t('emailZA', language)}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('sNo', language)}</th>
                <th>{t('name', language)}</th>
                <th>{t('email', language)}</th>
                <th>{t('actions', language)}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAdmins.length > 0 ? (
                paginatedAdmins.map((admin, index) => (
                  <tr key={admin.email}>
                    <td>{startIdx + index + 1}</td>
                    <td>
                      {admin.name}
                      {isCurrentUser(admin.email) && (
                        <span className="current-user-badge"> ({t('you', language)})</span>
                      )}
                    </td>
                    <td>{admin.email}</td>
                    <td className="actions-cell">
                      <button
                        className="btn-edit"
                        onClick={() => handleEditClick(admin)}
                      >
                        {t('edit', language)}
                      </button>
                      <button
                        className={`btn-delete ${isCurrentUser(admin.email) ? 'btn-delete-disabled' : ''}`}
                        onClick={() => handleDeleteClick(admin)}
                        disabled={isCurrentUser(admin.email)}
                        title={
                          isCurrentUser(admin.email)
                            ? t('adminCannotDelete', language)
                            : t('delete', language)
                        }
                      >
                        {t('delete', language)}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty-cell">
                    {t('noAdminsFound', language)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredAdmins.length > 0 && (
          <div className="pagination-section">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              {t('previous', language)}
            </button>
            <span className="pagination-info">
              {t('page', language)} {currentPage} {t('of', language)} {totalPages}
            </span>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              {t('next', language)}
            </button>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">{t('confirmDelete', language)}</div>
            <div className="modal-body">
              <p>{t('areYouSureDeleteAdmin', language)}</p>
              <div className="modal-details">
                <p>
                  <strong>{t('name', language)}:</strong> {deleteTarget?.name}
                </p>
                <p>
                  <strong>{t('email', language)}:</strong> {deleteTarget?.email}
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="modal-btn-cancel"
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteTarget(null)
                }}
              >
                {t('no', language)}
              </button>
              <button
                className="modal-btn-confirm"
                onClick={handleConfirmDelete}
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

export default ViewAdmin
