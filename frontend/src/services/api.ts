import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token")
  const tenantId = localStorage.getItem("tenant_id")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (tenantId) {
    config.headers["x-tenant-id"] = tenantId
  }

  return config
})

export default api