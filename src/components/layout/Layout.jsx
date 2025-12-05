import { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import Header from "./Header"
import Sidebar from "./Sidebar"
import { getCurrentUser } from "../../services/authService"

const Layout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState(null)
  const transitionClass = "transition-colors duration-300"

  const toggleSidebar = () => setSidebarOpen(prev => !prev)
  const closeSidebar = () => setSidebarOpen(false)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
  }, [])

  return (
    <div className={`min-h-screen bg-base-200 pt-16 ${transitionClass}`}>
      <Header toggleSidebar={toggleSidebar} user={user} />
      <div className="max-w-[2000px] mx-auto flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
        <main className={`flex-1 p-4 overflow-auto min-h-screen ${transitionClass}`}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
