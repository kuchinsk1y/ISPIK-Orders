import { Navigate } from "react-router-dom"
import { getCurrentUser, logoutUser } from "../services/authService"

const ProtectedRoute = ({ children }) => {
  const user = getCurrentUser()

  if (!user) {
    logoutUser()
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
