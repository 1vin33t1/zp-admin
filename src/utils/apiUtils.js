import axios from 'axios'
import { API_BASE_URL } from '../config/appConfig'

export const LANGUAGE_CODES = {
  en: 'en-US',
  hi: 'hi-IN',
  mr: 'mr-IN',
}

export const createAxiosInstance = (languageCode) => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': languageCode,
    },
  })

  return instance
}

export const getLanguageCode = (language) => {
  return LANGUAGE_CODES[language] || LANGUAGE_CODES.en
}
