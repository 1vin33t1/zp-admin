# Multi-Language Implementation Guide

## Overview
Complete multi-language support has been added to the project with support for English, Hindi, and Marathi. The language selector is available in the TopBar.

## Files Created/Modified

### New Files:
1. **LanguageContext.jsx** - React Context for language management
   - Stores selected language (defaults to 'en')
   - Persists language choice in localStorage
   - Provides `useLanguage()` hook for components

2. **translations.js** - Translation strings for all languages
   - Complete translations for: English, Hindi (hi-IN), Marathi (mr-IN)
   - Covers all UI text, buttons, labels, and messages
   - Helper function `t(key, language)` for easy access

3. **apiUtils.js** - API utilities with language support
   - `createAxiosInstance(languageCode)` - Creates axios instance with Accept-Language header
   - `getLanguageCode(language)` - Converts language code to Accept-Language format

### Modified Files:
1. **main.jsx** - Wrapped app with LanguageProvider
2. **TopBar.jsx** - Added language selector dropdown
3. **TopBar.css** - Added styling for language selector
4. **ViewStaff.jsx** - Example of multi-language implementation

## How to Use

### 1. In Components (using ViewStaff as example):

```jsx
import { useLanguage } from '../../context/LanguageContext'
import { t } from '../../utils/translations'
import { createAxiosInstance } from '../../utils/apiUtils'

const MyComponent = () => {
  const { language, getLanguageCode } = useLanguage()

  // Using translations
  const heading = t('staffList', language)

  // Making API calls with Accept-Language header
  const fetchData = async () => {
    const apiInstance = createAxiosInstance(getLanguageCode())
    const response = await apiInstance.get('https://api.pranvidyatech.in/...')
  }

  return <div>{heading}</div>
}
```

### 2. Language Codes Mapping:
- English: `en` → `en-US`
- Hindi: `hi` → `hi-IN`
- Marathi: `mr` → `mr-IN`

### 3. API Header Example:
```
Accept-Language: en-US
or
Accept-Language: hi-IN
or
Accept-Language: mr-IN
```

## Language Selector
Located in TopBar with three options:
- English
- हिंदी (Hindi)
- मराठी (Marathi)

Selection is automatically saved to localStorage and persists across sessions.

## Translation Keys Available
All common UI elements have translation keys:
- dashboard, logout, loading, error, success
- staffList, viewStaff, addStaff, editStaff
- viewAdmins, addAdmin, editAdmin
- addRegion, regionName
- And many more...

## Implementation Steps for Remaining Pages

For each page, follow this pattern:

1. Import hooks and utilities:
```jsx
import { useLanguage } from '../../context/LanguageContext'
import { t } from '../../utils/translations'
import { createAxiosInstance } from '../../utils/apiUtils'
```

2. Get language context:
```jsx
const { language, getLanguageCode } = useLanguage()
```

3. Use translations in JSX:
```jsx
<h1>{t('staffList', language)}</h1>
<button>{t('edit', language)}</button>
```

4. Use for API calls:
```jsx
const apiInstance = createAxiosInstance(getLanguageCode())
const response = await apiInstance.get('API_URL')
```

5. Add useEffect dependency for language changes:
```jsx
useEffect(() => {
  fetchData()
}, [language])
```

## Adding New Translation Keys

1. Add key to all three language objects in `translations.js`:
```js
export const translations = {
  en: {
    myNewKey: 'My English Text',
  },
  hi: {
    myNewKey: 'मेरी हिंदी पाठ',
  },
  mr: {
    myNewKey: 'माझा मराठी मजकूर',
  },
}
```

2. Use in component:
```jsx
const text = t('myNewKey', language)
```

## Features
✅ Automatic language persistence with localStorage
✅ Real-time language switching throughout app
✅ Accept-Language header sent with all API requests
✅ Complete translations for 3 languages
✅ Responsive language selector in TopBar
✅ Easy-to-use translation function

## Notes
- Language selection is saved per user/browser
- Changing language re-fetches data with new language header
- All new pages should follow the implementation pattern
- Add translations for all user-facing text before deployment
