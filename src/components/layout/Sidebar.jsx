import { NavLink } from "react-router-dom"
import { FiHome, FiClipboard, FiX } from "react-icons/fi"

const Sidebar = ({ isOpen, closeSidebar }) => {
  const linkClass = ({ isActive }) => `flex items-center px-4 py-3 rounded-lg my-1 transition-colors duration-500 ${isActive ? "bg-primary text-primary-content font-medium" : "text-base-content hover:bg-base-200"}`

  return (
    <>
      <div className={`fixed inset-0 bg-black/30 z-40 md:hidden transition-opacity duration-500 ease-in-out ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={closeSidebar}/>
      <aside className={`flex-shrink-0 p-4 bg-base-100 border-r border-base-300 shadow-lg md:bg-transparent md:border-none md:shadow-none fixed top-0 left-0 h-full z-40 md:static transform transition-transform duration-500 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:flex`}>
        <div className="flex justify-end md:hidden mb-4">
          <button className="btn btn-ghost btn-square transition-colors duration-500 ease-in-out" onClick={closeSidebar}>
            <FiX className="text-xl" />
          </button>
        </div>
        <nav className="space-y-2 transition-colors duration-500 ease-in-out">
          <NavLink to="/dashboard" className={linkClass} onClick={closeSidebar}>
            <FiHome className="mr-2 text-lg transition-colors duration-500 ease-in-out" /> Panel
          </NavLink>
          <NavLink to="/orders" className={linkClass} onClick={closeSidebar}>
            <FiClipboard className="mr-2 text-lg transition-colors duration-500 ease-in-out" /> Zamówienia
          </NavLink>
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
