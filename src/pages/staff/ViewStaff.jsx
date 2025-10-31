import { useState, useEffect } from 'react'
import axios from 'axios'
import './ViewStaff.css'
import TopBar from '../../components/TopBar.jsx'

const ViewStaff = ({ userEmail, onLogout }) => {
    const [staff, setStaff] = useState([])
    const [filteredStaff, setFilteredStaff] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedRegion, setSelectedRegion] = useState('')
    const [regions, setRegions] = useState([])
    const [sortBy, setSortBy] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [successMessage, setSuccessMessage] = useState('')

    const itemsPerPage = 10

    // Fetch staff data
    useEffect(() => {
        fetchStaff()
        fetchRegions()
    }, [])

    // Apply filters and search
    useEffect(() => {
        let result = [...staff]

        // Search by name
        if (searchTerm) {
            result = result.filter((s) =>
                s.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Filter by region
        if (selectedRegion) {
            result = result.filter((s) =>
                s.region.includes(selectedRegion)
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

        setFilteredStaff(result)
        setCurrentPage(1)
    }, [staff, searchTerm, selectedRegion, sortBy])

    const fetchStaff = async () => {
        setLoading(true)
        setError('')
        try {
            const response = await axios.get(
                'https://api.pranvidyatech.in/auth/all/staff?role=ZP_STAFF',
                { withCredentials: true }
            )
            setStaff(response.data.staff || [])
        } catch (err) {
            setError('Failed to fetch staff data')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const fetchRegions = async () => {
        try {
            const response = await axios.get(
                'https://api.pranvidyatech.in/auth/all/region?type=applicant',
                { withCredentials: true }
            )
            setRegions(response.data.region || [])
        } catch (err) {
            console.error('Failed to fetch regions:', err)
        }
    }

    const handleDeleteClick = (staffMember) => {
        setDeleteTarget(staffMember)
        setShowDeleteModal(true)
    }

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return

        try {
            const response = await axios.delete(
                'https://api.pranvidyatech.in/auth/staff',
                {
                    data: {
                        email: deleteTarget.email,
                        role: 'ZP_STAFF',
                    },
                    withCredentials: true,
                }
            )

            if (response.data.success) {
                setStaff((prev) => prev.filter((s) => s.email !== deleteTarget.email))
                setSuccessMessage(`Successfully deleted ${deleteTarget.name}`)
                setTimeout(() => setSuccessMessage(''), 3000)
            } else {
                setError(response.data.failureReason || 'Failed to delete staff')
            }
        } catch (err) {
            setError(err.response?.data?.failureReason || 'Failed to delete staff')
        } finally {
            setShowDeleteModal(false)
            setDeleteTarget(null)
        }
    }

    // Pagination
    const totalPages = Math.ceil(filteredStaff.length / itemsPerPage)
    const startIdx = (currentPage - 1) * itemsPerPage
    const paginatedStaff = filteredStaff.slice(startIdx, startIdx + itemsPerPage)

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
                <div className="page-heading">View Staff</div>

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

                        <div className="filter-box">
                            <select
                                value={selectedRegion}
                                onChange={(e) => setSelectedRegion(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">All Regions</option>
                                {regions.map((region) => (
                                    <option key={region} value={region}>
                                        {region}
                                    </option>
                                ))}
                            </select>
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
                    <table className="staff-table">
                        <thead>
                        <tr>
                            <th>S.No.</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Region</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {paginatedStaff.length > 0 ? (
                            paginatedStaff.map((staffMember, index) => (
                                <tr key={staffMember.email}>
                                    <td>{startIdx + index + 1}</td>
                                    <td>{staffMember.name}</td>
                                    <td>{staffMember.email}</td>
                                    <td>{staffMember.region.join(', ')}</td>
                                    <td className="actions-cell">
                                        <button className="btn-edit">Edit</button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDeleteClick(staffMember)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="empty-cell">
                                    No staff members found
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {filteredStaff.length > 0 && (
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
                            <p>Are you sure you want to delete this staff member?</p>
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

export default ViewStaff