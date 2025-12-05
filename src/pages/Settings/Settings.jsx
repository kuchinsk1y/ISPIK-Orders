import { useState, useEffect } from "react"
import PageTransition from "../../components/ui/PageTransition"
import { MdArrowBackIos } from "react-icons/md"
import { PiSunHorizonLight, PiMoonLight, PiTranslateLight, PiInfoLight, PiBellLight } from "react-icons/pi"
import { useNavigate } from "react-router-dom"
import { getCurrentUser } from "../../services/authService"
import { getAllowNotifications } from "../../services/ordersService"
import { callGasApi } from "../../api/gasApi"

const Settings = () => {
  const navigate = useNavigate()

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "nord"
  })

  const [powiadomienia, setPowiadomienia] = useState(false)
  const appVersion = "1.0.0"

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem("theme", theme)
  }, [theme])

  useEffect(() => {
    const user = getCurrentUser()
    if (user?.sub) getAllowNotifications(user.sub).then(setPowiadomienia)
  }, [])

  const handleToggleNotifications = async () => {
    const user = getCurrentUser()
    if (!user?.sub) return

    const newValue = !powiadomienia
    setPowiadomienia(newValue)

    try {
      await callGasApi("updateAllowNotifications", user.sub, newValue ? 1 : 0)
    } catch (err) {
      console.error("Ошибка при обновлении уведомлений:", err)
      setPowiadomienia(!newValue)
    }
  }

  const themeOptions = [
    { value: "nord", label: "Jasny", icon: <PiSunHorizonLight /> },
    { value: "night", label: "Ciemny", icon: <PiMoonLight /> },
  ]

  const languageOptions = [
    { value: "pl", label: "Polski" },
    { value: "en", label: "Angielski" },
    { value: "de", label: "Niemiecki" },
  ]

  return (
    <PageTransition className="space-y-5">
      <button className="btn btn-outline mb-3 flex items-center gap-2 rounded-md" onClick={() => navigate("/orders")}>
        <MdArrowBackIos className="text-lg" />
        <span>Do zamówień</span>
      </button>

      <div className="flex items-center justify-between p-4 border border-base-200 shadow-md rounded-lg">
        <div className="flex items-center gap-3">
          <PiMoonLight className="text-2xl opacity-80" />
          <span className="font-semibold">Motyw</span>
        </div>
        <select className="select select-sm border border-base-300 bg-base-100 rounded-md focus:outline-none" value={theme} onChange={(e) => setTheme(e.target.value)}>
          {themeOptions.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between p-4 border border-base-200 shadow-md rounded-lg">
        <div className="flex items-center gap-3">
          <PiTranslateLight className="text-2xl opacity-80" />
          <span className="font-semibold">Język</span>
        </div>
        <select className="select select-sm border border-base-300 bg-base-100 rounded-md cursor-not-allowed opacity-50" disabled value="pl">
          {languageOptions.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between p-4 border border-base-200 shadow-md rounded-lg">
        <div className="flex items-center gap-3">
          <PiBellLight className="text-2xl opacity-80" />
          <span className="font-semibold">Powiadomienia</span>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" checked={powiadomienia} onChange={handleToggleNotifications}/>
          <div className="border border-base-300 w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#637fa4] rounded-full peer-checked:bg-[#637fa4] transition-all duration-300"></div>
          <div className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${powiadomienia ? "translate-x-7" : "translate-x-0"}`}></div>
        </label>
      </div>

      <div className="flex items-center justify-between p-4 border border-base-200 shadow-md rounded-lg">
        <div className="flex items-center gap-3">
          <PiInfoLight className="text-2xl opacity-80" />
          <span className="font-semibold">Wersja aplikacji</span>
        </div>
        <span className="text-sm text-gray-500">{appVersion}</span>
      </div>
    </PageTransition>
  )
}

export default Settings
