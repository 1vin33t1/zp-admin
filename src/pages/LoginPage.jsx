import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './LoginPage.css'
import TopBar from '../components/TopBar'

const LoginPage = ({ onLoginSuccess }) => {
    const navigate = useNavigate()
    const [step, setStep] = useState('email') // email or otp
    const [email, setEmail] = useState('')
    const [emailError, setEmailError] = useState('')
    const [otp, setOtp] = useState(['', '', '', ''])
    const [otpError, setOtpError] = useState('')
    const [loading, setLoading] = useState(false)
    const [nextAttemptAt, setNextAttemptAt] = useState(null)
    const [remainingSeconds, setRemainingSeconds] = useState(0)
    const otpInputRefs = useRef([])

    // Email validation
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return re.test(email)
    }

    // Handle Send OTP
    const handleSendOtp = async () => {
        setEmailError('')

        if (!email) {
            setEmailError('Please enter your email address')
            return
        }

        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address')
            return
        }

        setLoading(true)
        try {
            const response = await axios.post(
                `https://api.pranvidyatech.in/auth/send-otp?role=ZP_ADMIN&email=${encodeURIComponent(email)}`,
                {},
                { withCredentials: true }
            )

            if (response.data.success) {
                setNextAttemptAt(response.data.nextAttemptAt)
                setStep('otp')
                setOtp(['', '', '', ''])
                otpInputRefs.current[0]?.focus()
            } else {
                setEmailError(response.data.failureReason || 'Failed to send OTP')
            }
        } catch (error) {
            setEmailError(error.response?.data?.failureReason || 'Failed to send OTP. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // Handle OTP input change
    const handleOtpChange = (index, value) => {
        if (!/^\d?$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value

        setOtp(newOtp)
        setOtpError('')

        // Auto-focus next input
        if (value && index < 3) {
            otpInputRefs.current[index + 1]?.focus()
        }

        // Auto-submit when all digits are filled
        if (newOtp.every((digit) => digit !== '')) {
            submitOtp(newOtp)
        }
    }

    // Handle backspace in OTP input
    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus()
        }
    }

    // Submit OTP
    const submitOtp = async (otpToSubmit) => {
        const otpCode = (otpToSubmit || otp).join('')

        if (otpCode.length !== 4) return

        setLoading(true)
        try {
            const response = await axios.post(
                `https://api.pranvidyatech.in/auth/verify-otp?role=ZP_ADMIN&email=${encodeURIComponent(email)}&otp=${otpCode}`,
                {},
                { withCredentials: true }
            )

            if (response.data.verified) {
                onLoginSuccess()
                navigate('/zp-admin/dashboard')
            } else {
                if (response.data.failureReason === 'user does not exist') {
                    setStep('email')
                    setOtp(['', '', '', ''])
                    setEmailError('Please re-enter email as you have failed multiple verify attempts')
                    setEmail('')
                } else {
                    setOtpError(response.data.failureReason || 'OTP verification failed')
                    setOtp(['', '', '', ''])
                    otpInputRefs.current[0]?.focus()
                }
            }
        } catch (error) {
            const failureReason = error.response?.data?.failureReason || 'OTP verification failed'
            if (failureReason === 'user does not exist') {
                setStep('email')
                setOtp(['', '', '', ''])
                setEmailError('Please re-enter email as you have failed multiple verify attempts')
                setEmail('')
            } else {
                setOtpError(failureReason)
                setOtp(['', '', '', ''])
                otpInputRefs.current[0]?.focus()
            }
        } finally {
            setLoading(false)
        }
    }

    // Handle edit email
    const handleEditEmail = () => {
        setStep('email')
        setOtp(['', '', '', ''])
        setOtpError('')
    }

    // Handle resend OTP
    const handleResendOtp = async () => {
        setLoading(true)
        try {
            const response = await axios.post(
                `https://api.pranvidyatech.in/auth/send-otp?role=ZP_ADMIN&email=${encodeURIComponent(email)}`,
                {},
                { withCredentials: true }
            )

            if (response.data.success) {
                setNextAttemptAt(response.data.nextAttemptAt)
                setOtp(['', '', '', ''])
                setOtpError('')
                otpInputRefs.current[0]?.focus()
            } else {
                setOtpError(response.data.failureReason || 'Failed to resend OTP')
            }
        } catch (error) {
            setOtpError(error.response?.data?.failureReason || 'Failed to resend OTP')
        } finally {
            setLoading(false)
        }
    }

    // Countdown timer for resend OTP
    useEffect(() => {
        if (!nextAttemptAt) return

        const interval = setInterval(() => {
            const now = Date.now()
            const remaining = Math.max(0, Math.ceil((nextAttemptAt - now) / 1000))
            setRemainingSeconds(remaining)

            if (remaining === 0) {
                clearInterval(interval)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [nextAttemptAt])

    return (
        <div className="login-page">
            <TopBar isLoggedIn={false} />
            <div className="login-content">
                <div className="login-container">
                    <div className="login-heading">ZP-Admin Login</div>

                    {step === 'email' ? (
                        <div>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    className={`form-input ${emailError ? 'error' : ''}`}
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value)
                                        setEmailError('')
                                    }}
                                    placeholder="Enter your email"
                                    disabled={loading}
                                />
                            </div>

                            {emailError && <div className="error-message">{emailError}</div>}

                            <button className="btn btn-primary" onClick={handleSendOtp} disabled={loading}>
                                {loading ? 'Sending...' : 'Send OTP'}
                            </button>
                        </div>
                    ) : (
                        <div className="otp-step">
                            <div className="email-display">
                                {email.toLowerCase()}
                                <a onClick={handleEditEmail} style={{ cursor: 'pointer' }}>
                                    edit
                                </a>
                            </div>

                            <div className="otp-inputs">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (otpInputRefs.current[index] = el)}
                                        type="text"
                                        className={`otp-input ${otpError ? 'error' : ''}`}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        maxLength="1"
                                        inputMode="numeric"
                                        disabled={loading}
                                    />
                                ))}
                            </div>

                            {otpError && <div className="error-message">{otpError}</div>}

                            <div className="button-group">
                                <button
                                    className={`btn-resend ${remainingSeconds === 0 ? 'active' : ''}`}
                                    onClick={handleResendOtp}
                                    disabled={remainingSeconds > 0 || loading}
                                >
                                    {remainingSeconds > 0 ? `Resend (${remainingSeconds}s)` : 'Resend OTP'}
                                </button>
                                <button className="btn-verify" onClick={() => submitOtp()} disabled={otp.some((d) => !d) || loading}>
                                    {loading ? 'Verifying...' : 'Verify OTP'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default LoginPage
