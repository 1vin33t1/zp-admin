import {useLocation, useNavigate} from 'react-router-dom'
import {useEffect, useState} from 'react'
import './EditStaff.css'
import TopBar from '../../components/TopBar'
import {useLanguage} from '../../context/LanguageContext'
import {t} from '../../utils/translations'
import {createAxiosInstance} from '../../utils/apiUtils'

const EditStaff = ({userEmail, onLogout}) => {
    const navigate = useNavigate()
    const location = useLocation()
    const {language, getLanguageCode} = useLanguage()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [postedRegion, setPostedRegion] = useState('')
    const [selectedRegions, setSelectedRegions] = useState([])
    const [originalEmail, setOriginalEmail] = useState('')
    const [regions, setRegions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Get staff data from location state
    const staffData = location.state?.staff

    useEffect(() => {
        if (!staffData) {
            setError('No staff data provided')
            setLoading(false)
            return
        }

        setName(staffData.name)
        setEmail(staffData.email)
        setOriginalEmail(staffData.email)
        setPostedRegion(staffData.postedTaluka || '')
        setSelectedRegions(staffData.designatedTaluka || [])

        fetchRegions()
    }, [staffData, language])

    const fetchRegions = async () => {
        try {
            const apiInstance = createAxiosInstance(getLanguageCode())
            const response = await apiInstance.get('/auth/all/region?type=applicant')
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

    const handleUpdateClick = () => {
        if (!name.trim()) {
            setError('Name cannot be empty')
            return
        }

        if (!postedRegion) {
            setError(t('postedRegionRequired', language))
            return
        }

        if (selectedRegions.length === 0) {
            setError(t('selectAtLeastOneRegion', language))
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
                    role: 'ZP_STAFF',
                    name: name,
                    postedTaluka: postedRegion,
                    designatedTaluka: selectedRegions,
                }
            )

            if (response.data.success) {
                setShowSuccessModal(true)
                setTimeout(() => {
                    navigate('/staff/view')
                }, 2000)
            } else {
                setError(response.data.failureReason || 'Failed to update staff')
            }
        } catch (err) {
            setError(err.response?.data?.failureReason || 'Failed to update staff')
        } finally {
            setIsSubmitting(false)
        }
    }

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

    if (error && !staffData) {
        return (
            <div className="page-container">
                <TopBar userEmail={userEmail} onLogout={onLogout} isLoggedIn={true}/>
                <div className="page-content">
                    <div className="error-message">{error}</div>
                    <button
                        onClick={() => navigate('/staff/view')}
                        className="btn-back-error"
                    >
                        {t('backToDashboard', language)}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="page-container">
            <TopBar userEmail={userEmail} onLogout={onLogout} isLoggedIn={true}/>
            <div className="page-content">
                <button onClick={() => navigate('/staff/view')} className="back-button">
                    ← {t('backToDashboard', language)}
                </button>

                <div className="page-heading">{t('editStaff', language)}</div>

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
                                placeholder="Email (cannot be edited)"
                            />
                            <div className="form-hint">
                                {t('emailAddressCannotBeChanged', language)}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('name', language)}</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="form-input"
                                placeholder="Enter staff name"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('postedRegion', language)}</label>
                            <select
                                value={postedRegion}
                                onChange={(e) => setPostedRegion(e.target.value)}
                                className="form-select"
                            >
                                <option value="">{t('postedRegionPlaceHolder', language)}</option>
                                {regions.map((region) => (
                                    <option key={region} value={region}>
                                        {region}
                                    </option>
                                ))}
                            </select>
                            <div className="form-hint">
                                {t('postedRegionHint', language)}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('regions', language)}</label>
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
                                        <label
                                            htmlFor={`region-${region}`}
                                            className="region-label"
                                        >
                                            {region}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="button-group">
                        <button
                            onClick={() => navigate('/staff/view')}
                            className="btn-cancel"
                        >
                            {t('backToDashboard', language)}
                        </button>
                        <button
                            onClick={handleUpdateClick}
                            className="btn-update"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? t('updating', language)
                                : t('updateStaff', language)}
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
                            <p>{t('areYouSureUpdate', language)}</p>
                            <div className="modal-details">
                                <p>
                                    <strong>{t('email', language)}:</strong> {email}
                                </p>
                                <p>
                                    <strong>{t('name', language)}:</strong> {name}
                                </p>
                                <p>
                                    <strong>{t('postedRegion', language)}:</strong> {postedRegion}
                                </p>
                                <p>
                                    <strong>{t('regions', language)}:</strong>{' '}
                                    {selectedRegions.join(', ')}
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
                                {t('yesUpdate', language)}
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
                            <p>{t('staffMemberUpdatedSuccessfully', language)}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default EditStaff