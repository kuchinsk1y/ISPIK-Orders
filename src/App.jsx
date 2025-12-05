import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Layout from "./components/layout/Layout"
import Dashboard from "./pages/Dashboard/Dashboard"
import Orders from "./pages/Orders/Orders"
import OrderFormPage from "./pages/Orders/components/OrderFormPage"
import Profile from "./pages/Profile/Profile"
import ProtectedRoute from "./components/ProtectedRoute"
import Settings from "./pages/Settings/Settings"
import LoginPage from "./pages/LoginPage"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
          <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>}/>
          <Route path="orders/new" element={<ProtectedRoute><OrderFormPage /></ProtectedRoute>}/>
          <Route path="orders/:id" element={<ProtectedRoute><OrderFormPage /></ProtectedRoute>}/>
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>}/>
          <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>}/>
        </Route>
      </Routes>
    </Router>
  )
}

export default App
