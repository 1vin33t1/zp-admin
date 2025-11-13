import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import './ViewStaff.css'
import TopBar from '../../components/TopBar'
import {useLanguage} from '../../context/LanguageContext'
import {t} from '../../utils/translations'
import {createAxiosInstance} from '../../utils/apiUtils'

const ViewStaff = ({userEmail, onLogout}) => {
    const navigate = useNavigate()
    const {language, getLanguageCode} = useLanguage()
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

    useEffect(() => {
        fetchStaff()
        fetchRegions()
    }, [language])

    useEffect(() => {
        let result = [...staff]

        if (searchTerm) {
            result = result.filter((s) =>
                s.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        if (selectedRegion) {
            result = result.filter((s) => s.region.includes(selectedRegion))
        }

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
            const apiInstance = createAxiosInstance(getLanguageCode())
            const response = await apiInstance.get(
                'https://api.gramsamruddhi.in/auth/all/staff?role=ZP_STAFF'
            )
            setStaff(response.data.staff || [])
        } catch (err) {
            setError(t('staffListError', language))
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const fetchRegions = async () => {
        try {
            const apiInstance = createAxiosInstance(getLanguageCode())
            const response = await apiInstance.get(
                'https://api.gramsamruddhi.in/auth/all/region?type=applicant'
            )
            const sortedRegions = response.data.region.sort((a, b) => {
                return a.localeCompare(b);
            });

            setRegions(sortedRegions || [])
        } catch (err) {
            console.error('Failed to fetch regions:', err)
        }
    }

    const handleEditClick = (staffMember) => {
        navigate('/staff/edit', {state: {staff: staffMember}})
    }

    const handleDeleteClick = (staffMember) => {
        setDeleteTarget(staffMember)
        setShowDeleteModal(true)
    }

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return

        try {
            const apiInstance = createAxiosInstance(getLanguageCode())
            const response = await apiInstance.delete(
                'https://api.gramsamruddhi.in/auth/staff',
                {
                    data: {
                        email: deleteTarget.email,
                        role: 'ZP_STAFF',
                    },
                }
            )

            if (response.data.success) {
                setStaff((prev) => prev.filter((s) => s.email !== deleteTarget.email))
                setSuccessMessage(
                    `${t('successfullyDeleted', language)} ${deleteTarget.name}`
                )
                setTimeout(() => setSuccessMessage(''), 3000)
            } else {
                setError(response.data.failureReason || t('error', language))
            }
        } catch (err) {
            setError(err.response?.data?.failureReason || t('error', language))
        } finally {
            setShowDeleteModal(false)
            setDeleteTarget(null)
        }
    }

    const totalPages = Math.ceil(filteredStaff.length / itemsPerPage)
    const startIdx = (currentPage - 1) * itemsPerPage
    const paginatedStaff = filteredStaff.slice(startIdx, startIdx + itemsPerPage)

    if (loading) {
        return (
            <div className="page-container">
                <TopBar userEmail={userEmail} onLogout={onLogout} isLoggedIn={true}/>
                <div className="page-content">
                    <div style={{textAlign: 'center', padding: '48px'}}>
                        {t('loading', language)}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="page-container">
            <TopBar userEmail={userEmail} onLogout={onLogout} isLoggedIn={true}/>
            <div className="page-content">
                <button onClick={() => navigate('/dashboard')} className="back-button">
                    ← {t('backToDashboard', language)}
                </button>

                <div className="page-heading">{t('staffList', language)}</div>

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

                        <div className="filter-box">
                            <select
                                value={selectedRegion}
                                onChange={(e) => setSelectedRegion(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">{t('allRegions', language)}</option>
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
                    <table className="staff-table">
                        <thead>
                        <tr>
                            <th>{t('sNo', language)}</th>
                            <th>{t('name', language)}</th>
                            <th>{t('email', language)}</th>
                            <th>{t('phone', language)}</th>
                            <th>{t('postedTaluka', language)}</th>
                            <th>{t('designatedTaluka', language)}</th>
                            <th>{t('actions', language)}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {paginatedStaff.length > 0 ? (
                            paginatedStaff.map((staffMember, index) => (
                                <tr key={staffMember.email}>
                                    <td>{startIdx + index + 1}</td>
                                    <td>{staffMember.name}</td>
                                    <td>{staffMember.email}</td>
                                    <td>{staffMember.mobile ? staffMember.mobile : "-"}</td>
                                    <td>{staffMember.postedTaluka ? staffMember.postedTaluka.join(', ') : '-'}</td>
                                    <td>{staffMember.designatedTaluka ? staffMember.designatedTaluka.join(', ') : '-'}</td>
                                    <td className="actions-cell">
                                        <button
                                            className="btn-edit"
                                            onClick={() => handleEditClick(staffMember)}
                                        >
                                            {t('edit', language)}
                                        </button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDeleteClick(staffMember)}
                                        >
                                            {t('delete', language)}
                                        </button>
                                    </td>
                                </tr>
                            ))
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

                {filteredStaff.length > 0 && (
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
                            <p>{t('areYouSureDelete', language)}</p>
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

export default ViewStaff
