import {useNavigate} from 'react-router-dom'
import './TopBar.css'
import {useEffect, useState} from 'react'
import {useLanguage} from '../context/LanguageContext'
import {t} from '../utils/translations'
import { ROUTES, SESSION_TIMEOUT_MS } from '../config/appConfig'

const TopBar = ({userEmail, onLogout, isLoggedIn}) => {
    const [remainingTime, setRemainingTime] = useState('15:00')

    const navigate = useNavigate()
    const {language, setLanguage} = useLanguage()

    useEffect(() => {
        if (!isLoggedIn) return;

        const interval = setInterval(() => {
            const lastActivityString = localStorage.getItem('adminLastActivity');

            if (!lastActivityString) {
                clearInterval(interval);
                setRemainingTime('0:00');
                handleLogout();
                return;
            }

            const lastActivity = new Date(lastActivityString);
            const diffMs = Date.now() - lastActivity.getTime();
            const totalSessionSeconds = Math.floor(SESSION_TIMEOUT_MS / 1000);
            const remainingSeconds = totalSessionSeconds - Math.floor(diffMs / 1000);

            if (remainingSeconds <= 0) {
                clearInterval(interval);
                setRemainingTime('0:00');
                handleLogout();
                return;
            }

            const minutes = Math.floor(remainingSeconds / 60);
            const seconds = remainingSeconds % 60;
            setRemainingTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);

        // start listening for user activity
        const stopMonitoring = startActivityMonitoring();

        return () => {
            clearInterval(interval);
            // remove event listeners on unmount / logout
            if (typeof stopMonitoring === 'function') {
                stopMonitoring();
            }
        };
    }, [isLoggedIn]);

    const handleLogout = async () => {
        await onLogout()
    }

    const resetActivityTimer = () => {
        localStorage.setItem('adminLastActivity', new Date().toISOString());
    }

    const startActivityMonitoring = () => {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']

        events.forEach(event => {
            document.addEventListener(event, resetActivityTimer)
        })

        resetActivityTimer()

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, resetActivityTimer)
            })
        }
    }

    const handleBrandClick = () => {
        navigate(ROUTES.dashboard)
    }

    return (
        <div className="top-bar">
            <div className="top-bar-left">
                <div
                    className="top-bar-brand"
                    onClick={handleBrandClick}
                    style={{cursor: 'pointer'}}
                >
                    ग्राम समृद्धि, चंद्रपूर
                </div>
                {isLoggedIn && (
                    <button
                        onClick={handleBrandClick}
                        className="dashboard-nav-link"
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                        }}
                    >
                        {t('dashboard', language)}
                    </button>
                )}
            </div>

            {isLoggedIn && (
                <div className="top-bar-right">
                    <div className="language-selector">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="language-dropdown"
                            title="Select Language"
                        >
                            <option value="en">English</option>
                            <option value="hi">हिंदी</option>
                            <option value="mr">मराठी</option>
                        </select>
                    </div>

                    <div className="activity-timer">
                        {t('sessionTimeout', language)} {remainingTime}
                    </div>
                    <div className="user-info">
                        <div className="user-email">{userEmail}</div>
                        <button className="logout-btn" onClick={handleLogout}>
                            {t('logout', language)}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TopBar
