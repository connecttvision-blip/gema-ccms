import { useState } from "react"
import { login } from "./auth.service"

export function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      const data = await login({ email, password })

      localStorage.setItem("access_token", data.access_token)
      localStorage.setItem(
        "tenant_id",
        "00ff437a-7e7e-4d9d-8d69-de206d6d9324"
      )

      alert("Login realizado com sucesso")
    } catch (error) {
      alert("Erro no login")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-96 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">Login GEMA</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          className="w-full border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-gray-900 text-white p-2 rounded"
        >
          Entrar
        </button>
      </form>
    </div>
  )
}