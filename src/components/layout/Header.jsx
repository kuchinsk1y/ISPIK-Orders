import { useState, useEffect, useRef } from "react"
import { HiOutlineMenu } from "react-icons/hi"
import { PiSunHorizonLight } from "react-icons/pi"
import { useNavigate } from "react-router-dom"
import { getCurrentUser } from "../../services/authService"

const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "nord"
  })

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem("theme", theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => (prev === "nord" ? "night" : "nord"))

  return [theme, toggleTheme]
}

const getInitials = (name) => {
  if (!name) return ""
  const parts = name.split(" ").filter(Boolean)
  return parts.reverse().map(n => n[0]).join("").toUpperCase()
}

const Header = ({ toggleSidebar }) => {
  const [theme] = useTheme()
  const [user, setUser] = useState(null)
  const [open, setOpen] = useState(false)
  const menuRef = useRef()
  const navigate = useNavigate()

  useEffect(() => {
    const interval = setInterval(() => {
      const current = getCurrentUser()
      if (current) setUser(current)
    }, 300)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="fixed top-0 left-0 w-full h-16 z-50 border-b border-base-300 bg-base-100 shadow-md">
      <div className="max-w-[2000px] mx-auto px-4 flex items-center justify-between h-full">
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Toggle sidebar" className="md:hidden btn btn-square btn-ghost" onClick={toggleSidebar}>
            <HiOutlineMenu className="h-6 w-6" />
          </button>

          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PiSunHorizonLight aria-hidden="true" />
            <span className="sr-only">Logo</span>
          </h1>
        </div>

        <div className="relative" ref={menuRef}>
          <button type="button" className="btn btn-sm btn-outline" onClick={() => setOpen(prev => !prev)} title={user?.email || "Brak adresu e-mail"}>
            {user ? getInitials(user.name) : "Konto"}
          </button>

          {open && (
            <ul className="absolute right-0 mt-2 w-40 bg-base-100 shadow-lg rounded-lg border border-base-300 p-2 z-50">
              <li>
                <button className="w-full text-left p-2 rounded hover:bg-base-200" onClick={() => { setOpen(false); navigate("/profile") }}>Konto</button>
              </li>
              <li>
                <button className="w-full text-left p-2 rounded hover:bg-base-200" onClick={() => { setOpen(false); navigate("/settings") }}>Ustawienia</button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
