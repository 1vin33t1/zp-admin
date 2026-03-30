export const APP_BASENAME = '/zp-admin'

export const API_BASE_URL = 'https://api.gramsamruddhi.in'

export const SESSION_TIMEOUT_MS = 15 * 60 * 1000

export const ROUTES = {
  login: '/',
  dashboard: '/dashboard',
  activity: '/activity',
  staffView: '/staff/view',
  staffAdd: '/staff/add',
  staffEdit: '/staff/edit',
  staffApplications: '/staff/applications',
  assignAuditor: (applicationId = ':applicationId') =>
    `/staff/application/${applicationId}/assign-auditor`,
  adminView: '/admin/view',
  adminAdd: '/admin/add',
  adminEdit: '/admin/edit',
  regionAdd: '/region/add',
}

export const getApiUrl = (path) => `${API_BASE_URL}${path}`
