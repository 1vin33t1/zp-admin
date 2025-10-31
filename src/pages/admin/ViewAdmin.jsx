import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './ViewAdmin.css'
import TopBar from '../../components/TopBar'

const ViewAdmin = ({ userEmail, onLogout }) => {
  const navigate = useNavigate()
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
  }, [])

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
      const response = await axios.get(
        'https://api.gramsamruddhi.in/auth/all/staff?role=ZP_ADMIN',
        { withCredentials: true }
      )
      setAdmins(response.data.staff || [])
    } catch (err) {
      setError('Failed to fetch admin data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (admin) => {
    navigate('/admin/edit', { state: { admin } })
  }

  const handleDeleteClick = (admin) => {
    setDeleteTarget(admin)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    try {
      const response = await axios.delete(
        'https://api.gramsamruddhi.in/auth/staff',
        {
          data: {
            email: deleteTarget.email,
            role: 'ZP_ADMIN',
          },
          withCredentials: true,
        }
      )

      if (response.data.success) {
        setAdmins((prev) => prev.filter((a) => a.email !== deleteTarget.email))
        setSuccessMessage(`Successfully deleted ${deleteTarget.name}`)
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setError(response.data.failureReason || 'Failed to delete admin')
      }
    } catch (err) {
      setError(err.response?.data?.failureReason || 'Failed to delete admin')
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

        <div className="page-heading">View Admins</div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <div className="controls-section">
          <div className="search-filter-group">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by name..."
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
                <option value="">Sort By</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="email-asc">Email (A-Z)</option>
                <option value="email-desc">Email (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Name</th>
                <th>Email</th>
                <th>Actions</th>
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
                        <span className="current-user-badge"> (You)</span>
                      )}
                    </td>
                    <td>{admin.email}</td>
                    <td className="actions-cell">
                      <button
                        className="btn-edit"
                        onClick={() => handleEditClick(admin)}
                      >
                        Edit
                      </button>
                      <button
                        className={`btn-delete ${isCurrentUser(admin.email) ? 'btn-delete-disabled' : ''}`}
                        onClick={() => handleDeleteClick(admin)}
                        disabled={isCurrentUser(admin.email)}
                        title={isCurrentUser(admin.email) ? 'Cannot delete your own account' : 'Delete'}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty-cell">
                    No admins found
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
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">Confirm Delete</div>
            <div className="modal-body">
              <p>Are you sure you want to delete this admin?</p>
              <div className="modal-details">
                <p>
                  <strong>Name:</strong> {deleteTarget?.name}
                </p>
                <p>
                  <strong>Email:</strong> {deleteTarget?.email}
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
                No
              </button>
              <button
                className="modal-btn-confirm"
                onClick={handleConfirmDelete}
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

export default ViewAdmin
