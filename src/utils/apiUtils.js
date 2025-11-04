import axios from 'axios'

export const createAxiosInstance = (languageCode) => {
  const instance = axios.create({
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': languageCode,
    },
  })

  return instance
}

export const getLanguageCode = (language) => {
  const codes = {
    en: 'en-US',
    hi: 'hi-IN',
    mr: 'mr-IN',
  }
  return codes[language] || 'en-US'
}
