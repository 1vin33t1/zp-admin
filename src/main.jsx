import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router basename="/zp-admin">
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </Router>
  </StrictMode>
)
