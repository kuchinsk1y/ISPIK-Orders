import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import PageTransition from "../../components/ui/PageTransition"
import OrdersTable from "../../components/orders/OrdersTable"
import StatsCards from "./components/StatsCards"
import OrdersChart from "./components/OrdersChart"
import OrdersByUserDonut from "./components/OrdersByUserDonut"
import { FiClipboard, FiClock, FiCheckCircle, FiCreditCard } from "react-icons/fi"
import { getOrdersData } from "../../services/ordersService"
import { STORAGE_KEYS } from "../../constants"
import { initThemeFromStorage } from "../../utils"
import { loginUserBySub, logoutUser } from "../../services/authService"

const Dashboard = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    initThemeFromStorage(STORAGE_KEYS.theme, "nord")
  }, [])

  async function fetchRates(currencies) {
    const rates = {}

    for (const cur of currencies) {
      if (cur === "PLN") {
        rates[cur] = 1
        continue
      }

      try {
        const res = await fetch(`https://api.nbp.pl/api/exchangerates/rates/A/${cur}?format=json`)
        const json = await res.json()
        rates[cur] = json.rates[0].mid
      } catch (e) {
        console.error("Błąd kursu:", cur, e)
        rates[cur] = 1
      }
    }

    return rates
  }


  useEffect(() => {
    async function init() {
      try {
        const fresh = await loginUserBySub()
        setUser({ sub: fresh.sub, role: fresh.role, name: fresh.name || "" })
  
        const data = await getOrdersData({
          sortField: "createdAt",
          sortDirection: "desc",
          last90Days: true,
        })
  
        const currencies = [...new Set(data.orders.map(o => o.currency).filter(Boolean))]
  
        const rates = await fetchRates(currencies)
  
        const normalizedOrders = data.orders.map((o, i) => {
          const rate = rates[o.currency] || 1
          const priceStr = String(o.totalPrice || "0").replace(",", ".")
          const totalPrice = Number(priceStr) * rate
  
          return {
            id: i + 1,
            ...o,
            totalPricePLN: totalPrice,
          }
        })
  
        setOrders(normalizedOrders)
  
      } catch (err) {
        console.error(err)
        logoutUser()
        navigate("/login")
      } finally {
        setLoading(false)
      }
    }
  
    init()
  }, [navigate])

  const stats = useMemo(() => {
  const nowe = orders?.filter((o) => o.status === "nowe")?.length || 0
  const doPotwierdzenia = orders?.filter((o) => o.status === "do potwierdzenia")?.length || 0

  const totalPrice = orders?.reduce((sum, o) => {
    const v = Number(o.totalPricePLN || 0)
    return sum + (isNaN(v) ? 0 : v)
  }, 0) || 0

  return [
      { title: "Łączna liczba zamówień", value: orders?.length || 0, icon: <FiClipboard /> },
      { title: "Nowe zamówienia", value: nowe, icon: <FiClock /> },
      { title: "Suma zamówień (PLN)", value: totalPrice, icon: <FiCreditCard />, 
        format: (v) => v.toLocaleString("pl-PL", { minimumFractionDigits: 2 }) },
      { title: "Do potwierdzenia", value: doPotwierdzenia, icon: <FiCheckCircle /> },
    ]
  }, [orders])


  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Заголовок страницы */}
        <header>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-base-content">Panel Sterowania</h1>
          <p className="text-lg text-base-content/70 mt-1">Dane z ostatnich 90 dni</p>
        </header>

        {/* Карточки статистики */}
        <section className="bg-base-100 p-4 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Statystyki</h2>
          <StatsCards stats={stats} loading={loading} />
        </section>

        {/* Графики */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Блок с линейным графиком */}
          <div className="bg-base-100 p-4 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Wykres zamówień (suma tygodniowo)</h2>
            <OrdersChart orders={orders} />
          </div>
        
          {/* Блок с донат-графиком по пользователям */}
          <div className="bg-base-100 p-4 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Zamówienia według użytkowników</h2>
            <OrdersByUserDonut orders={orders} />
          </div>
        </section>

        {/* Таблица последних заказов */}
        <section className="bg-base-100 p-4 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Ostatnie zamówienia</h2>
          <OrdersTable
            orders={orders
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 5)
            }
            loading={loading}
            error={error}
            enableFilters={false}
            enablePageSizeSelector={false}
            pageSize={5}
            showMagazine={false}
            showLink={false}
            enableRowClick={false}
            showEditColumn={false}
            enablePriceEdit={false}
            showTfoot={false}
          />
        </section>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
