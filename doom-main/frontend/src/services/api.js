import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getForecast: (params) => api.get('/dashboard/forecast', { params }),
  getRecommendations: () => api.get('/dashboard/recommendations'),
  getRecentActivity: (limit = 10) => api.get(`/dashboard/recent-activity?limit=${limit}`),
  askTechz: (query) => api.post('/dashboard/ask', { query }),
}

export const booksApi = {
  list: (params) => api.get('/books', { params }),
  get: (bookId) => api.get(`/books/${bookId}`),
  upload: (formData) => api.post('/books/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  }),
}

export const intelligenceApi = {
  get: (bookId) => api.get(`/books/${bookId}/intelligence`),
  search: (bookId, q) => api.get(`/books/${bookId}/intelligence/search`, { params: { q } }),
}

export const summaryApi = {
  get: (bookId) => api.get(`/books/${bookId}/summary`),
  getExamNotes: (bookId) => api.get(`/books/${bookId}/summary/exam-notes`),
  getFlashcards: (bookId) => api.get(`/books/${bookId}/summary/flashcards`),
  getMCQs: (bookId) => api.get(`/books/${bookId}/summary/mcqs`),
}

export const askBookApi = {
  ask: (bookId, question) => api.post(`/books/${bookId}/ask`, { question }),
}

export const demandApi = {
  getForecasts: () => api.get('/demand/forecasts'),
  getBookForecast: (bookId) => api.get(`/demand/forecasts/${bookId}`),
  simulateEnrollment: (payload) => api.post('/demand/simulate-enrollment', payload),
}

export const ordersApi = {
  list: (status) => api.get('/orders', { params: status ? { status } : {} }),
  get: (orderId) => api.get(`/orders/${orderId}`),
  create: (payload) => api.post('/orders', payload),
  approve: (orderId) => api.post(`/orders/${orderId}/approve`),
}

export const academicsApi = {
  getStudents: (params) => api.get('/academics/students', { params }),
  enrollStudent: (data) => api.post('/academics/students', data),
  getTeachers: (params) => api.get('/academics/teachers', { params }),
  getCourses: (params) => api.get('/academics/courses', { params }),
  getAttendance: () => api.get('/academics/attendance'),
  getExams: () => api.get('/academics/exams'),
  getAssignments: () => api.get('/academics/assignments'),
  getTimetable: () => api.get('/academics/timetable'),
}

export const resourcesApi = {
  list: (params) => api.get('/resources', { params }),
}

export const aiApi = {
  getActivity: (limit = 25) => api.get(`/ai/activity?limit=${limit}`),
  getStatus: () => api.get('/ai/status'),
  getNotifications: () => api.get('/ai/notifications'),
  markRead: (notifId) => api.post(`/ai/notifications/${notifId}/read`),
}

export const searchApi = {
  search: (q) => api.get('/search', { params: { q } }),
}

export default api
