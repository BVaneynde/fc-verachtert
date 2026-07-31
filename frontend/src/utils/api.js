import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000',
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
})

// Add timestamp to every request to prevent caching
apiClient.interceptors.request.use(config => {
  config.params = config.params || {}
  config.params.t = new Date().getTime()
  return config
})

export default apiClient
