import {useNavigate} from 'react-router-dom'
import {useEffect, useState} from 'react'
import './AddStaff.css'
import TopBar from '../../components/TopBar'
import {useLanguage} from '../../context/LanguageContext'
import {t} from '../../utils/translations'
import {createAxiosInstance} from '../../utils/apiUtils'

const AddStaff = ({userEmail, onLogout}) => {
    const navigate = useNavigate()
    const {language, getLanguageCode} = useLanguage()
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [postedRegion, setPostedRegion] = useState('')
    const [selectedRegions, setSelectedRegions] = useState([])
    const [regions, setRegions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Email validation regex
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return re.test(email)
    }

    // Fetch regions on component mount
    useEffect(() => {
        fetchRegions()
    }, [language])

    const fetchRegions = async () => {
        try {
            const apiInstance = createAxiosInstance(getLanguageCode())
            const response = await apiInstance.get('/auth/all/region?type=applicant')
            const sortedRegions = response.data.region.sort((a, b) => {
                return a.localeCompare(b);
            });
            setRegions(sortedRegions || [])
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

        if (!postedRegion) {
            setError(t('postedRegionRequired', language))
            return false
        }

        if (selectedRegions.length === 0) {
            setError(t('selectAtLeastOneRegion', language))
            return false
        }

        return true
    }

    const handleAddStaffClick = () => {
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
                    role: 'ZP_STAFF',
                    postedTaluka: postedRegion,
                    designatedTaluka: selectedRegions,
                    name: name,
                }
            )

            if (response.data.success) {
                setShowSuccessModal(true)
                setTimeout(() => {
                    navigate('/dashboard')
                }, 2000)
            } else {
                setError(response.data.failureReason || t('staffAddFailure', language))
            }
        } catch (err) {
            setError(err.response?.data?.failureReason || t('staffAddFailure', language))
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

    return (
        <div className="page-container">
            <TopBar userEmail={userEmail} onLogout={onLogout} isLoggedIn={true}/>
            <div className="page-content">
                <button onClick={() => navigate('/dashboard')} className="back-button">
                    ← {t('backToDashboard', language)}
                </button>

                <div className="page-heading">{t('addStaff', language)}</div>

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
                                placeholder="Enter staff email"
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
                                placeholder="Enter staff name"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('postedRegion', language)} *</label>
                            <select
                                value={postedRegion}
                                onChange={(e) => {
                                    setPostedRegion(e.target.value)
                                    setError('')
                                }}
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
                            <label className="form-label">{t('assignedRegions', language)} *</label>
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
                                        <label htmlFor={`region-${region}`} className="region-label">
                                            {region}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="button-group">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="btn-cancel"
                        >
                            {t('backToDashboard', language)}
                        </button>
                        <button
                            onClick={handleAddStaffClick}
                            className="btn-add"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? t('adding', language) : t('addStaffButton', language)}
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirm Add Modal */}
            {showConfirmModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">{t('confirmAddStaff', language)}</div>
                        <div className="modal-body">
                            <p>{t('areYouSureAdd', language)}</p>
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
                                    <strong>{t('regions', language)}:</strong> {selectedRegions.join(', ')}
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
                                {t('yesAdd', language)}
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
                            <p>{t('staffMemberAddedSuccessfully', language)}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AddStaff