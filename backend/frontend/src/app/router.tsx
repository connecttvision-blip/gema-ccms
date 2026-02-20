import { createBrowserRouter } from "react-router-dom"
import { MainLayout } from "../layouts/MainLayout"
import { DashboardPage } from "../modules/dashboard/DashboardPage"
import { LoginPage } from "../modules/auth/LoginPage"

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <MainLayout>
        <DashboardPage />
      </MainLayout>
    ),
  },
])