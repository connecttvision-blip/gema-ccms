import axios from "axios"

const api = axios.create({
  baseURL: "/api",
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token")

  // ✅ sempre enviar tenant fixo (até implementarmos multi-tenant dinâmico)
  config.headers["x-tenant-id"] =
    "00ff437a-7e7e-4d9d-8d69-de206d6d9324"

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api