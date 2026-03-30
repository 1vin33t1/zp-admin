import { createContext, useState, useContext, useEffect } from 'react'
import { getLanguageCode as resolveLanguageCode } from '../utils/apiUtils'

const LanguageContext = createContext()

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language')
    return saved || 'en'
  })

  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  const getLanguageCode = () => resolveLanguageCode(language)

  return (
    <LanguageContext.Provider value={{ language, setLanguage, getLanguageCode }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
