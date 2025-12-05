import { useState, useEffect } from "react"
import { FiUser, FiMail, FiBriefcase } from "react-icons/fi"
import PageTransition from "../../components/ui/PageTransition"
import { fetchOrdersWithCache } from "../../services/ordersCacheService"
import { useNavigate } from "react-router-dom"
import { getCurrentUserFromToken } from "../../services/authService"
import { getUserPositionBySub } from "../../services/ordersService"
import { MdArrowBackIos } from "react-icons/md"

const Profile = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [position, setPosition] = useState("")

  const user = getCurrentUserFromToken() || { name: "Nieznany Użytkownik", email: "brak.email@domain.com", role: "brak roli", sub: null }

  useEffect(() => {
    if (!user.sub) return

    const loadPosition = async () => {
      const pos = await getUserPositionBySub(user.sub)
      if (pos) setPosition(pos)
    }

    loadPosition()
  }, [user.sub])

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { orders } = await fetchOrdersWithCache()
        setOrders(orders)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [])

  return (
    <PageTransition className="space-y-6">
      <button className="btn btn-outline mb-3 flex items-center gap-2 rounded-md" onClick={() => navigate("/orders")}>
        <MdArrowBackIos className="text-lg" />
        <span>Do zamówień</span>
      </button>

      <div className="card shadow-md p-6 flex flex-col items-start gap-3 transition-colors duration-300 border border-base-200 max-w-lg">
        <h2 className="text-3xl font-bold flex items-center gap-3 text-base-content">
          <FiUser className="text-primary text-2xl" />
          {user.name}
        </h2>

        <p className="flex items-center gap-3 text-base-content/80 text-lg">
          <FiMail className="text-secondary" />
          {user.email}
        </p>

        <p className="flex items-center gap-3 text-base-content/80 text-lg capitalize">
          <FiBriefcase className="text-info" />
          {position}
        </p>
      </div>
    </PageTransition>
  )
}

export default Profile
