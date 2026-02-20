import api from "../../services/api"

interface LoginPayload {
  email: string
  password: string
}

interface LoginResponse {
  access_token: string
}

export async function login(data: LoginPayload) {
  const response = await api.post<LoginResponse>("/auth/login", data)

  return response.data
}