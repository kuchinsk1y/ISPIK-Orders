import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ClipLoader } from "react-spinners"
import { FaExternalLinkAlt, FaPen } from "react-icons/fa"
import { getCurrentUser } from "../../services/authService"
import { callGasApi } from "../../api/gasApi"
import toast, { Toaster } from "react-hot-toast"

const OrdersTable = ({orders = [], loading, error, enableFilters = true, enableRowClick = false, showMagazine = true, showLink = true, showEditColumn = true, enablePriceEdit = true, showTfoot = true}) => {
  const navigate = useNavigate()
  const [selectedOrders, setSelectedOrders] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [localOrders, setLocalOrders] = useState(orders)
  const [editingPriceId, setEditingPriceId] = useState(null)
  const [priceInputValue, setPriceInputValue] = useState("")

  const [showActions, setShowActions] = useState(false)

  const handlePriceSave = async (order) => {
    if (!currentUser) return toast.error("Nie znaleziono użytkownika")

    const newPrice = parseFloat(priceInputValue)
    if (isNaN(newPrice) || newPrice < 0) return setEditingPriceId(null)

    const newCurrency = order.currency || "PLN"

    if (newPrice === parseFloat(order.pricePerUnit) && newCurrency === order.currency) return setEditingPriceId(null)

    setUpdating(true)
    try {
      await callGasApi("updateOrderPrice", {
        id: order.id,
        pricePerUnit: newPrice,
        quantity: order.quantity,
        currency: newCurrency,
        sub: currentUser.sub,
      })

      setLocalOrders(prev => prev.map(o => o.id === order.id ? { ...o, pricePerUnit: newPrice, totalPrice: newPrice * (o.quantity || 0), currency: newCurrency } : o))

      toast.success("Cena zaktualizowana ✅")
    } catch (err) {
      console.error(err)
      toast.error("Błąd przy aktualizacji ceny ❌")
    } finally {
      setUpdating(false)
      setEditingPriceId(null)
    }
  }

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
  }, [])

  useEffect(() => {
    if (!loading) setLocalOrders(orders)
  }, [orders, loading])

  const toggleSelectAll = () => setSelectedOrders((prev) => prev.length === localOrders.length ? [] : localOrders.map((o) => o.id))
  const toggleSelectOne = (id) => setSelectedOrders((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id])

  const selectedStatuses = useMemo(
    () => localOrders.filter((o) => selectedOrders.includes(o.id)).map((o) => o.status),
    [selectedOrders, localOrders]
  )

  // const totalsByCurrency = localOrders.reduce((acc, o) => {
  //   if (!o.pricePerUnit || !o.currency) return acc
  //   const pricePerUnit = parseFloat(o.pricePerUnit) || 0
  //   if (!acc[o.currency]) acc[o.currency] = 0
  //   acc[o.currency] += pricePerUnit
  //   return acc
  // }, {})

  /* ======================================================== Кнопки действий(по клику на чекбокс) ======================================================== */
  const getAvailableActions = (role, selectedStatuses) => {
    if (!role || !selectedStatuses.length) return []
    const statusesSet = new Set(selectedStatuses)
    if (statusesSet.size !== 1) return []
    const status = selectedStatuses[0]
    const actions = []
    switch (role) {
      case "admin":
        if (status === "nowe")
          actions.push({ buttonLabel: "Do potwierdzenia", newStatus: "do potwierdzenia" })
        if (status === "do potwierdzenia")
          actions.push({ buttonLabel: "Zatwierdź wybrane", newStatus: "do opłaty" })
        if (status === "do opłaty")
          actions.push({ buttonLabel: "Oznacz jako opłacone", newStatus: "opłacone" })
        if (status === "opłacone") {
          actions.push({ buttonLabel: "W drodze na budowę", newStatus: "w drodze na budowę" })
          actions.push({ buttonLabel: "Na magazynie", newStatus: "na magazynie" })
          actions.push({ buttonLabel: "W drodze do biura", newStatus: "w drodze do biura" })
        }
        break
      case "order_manager":
        if (status === "nowe")
          actions.push({ buttonLabel: "Do potwierdzenia", newStatus: "do potwierdzenia" })
        if (status === "opłacone") {
          actions.push({ buttonLabel: "W drodze na budowę", newStatus: "w drodze na budowę" })
          actions.push({ buttonLabel: "Na magazynie", newStatus: "na magazynie" })
          actions.push({ buttonLabel: "W drodze do biura", newStatus: "w drodze do biura" })
        }
        break
      case "approver":
        if (status === "do potwierdzenia")
          actions.push({ buttonLabel: "Zatwierdź wybrane", newStatus: "do opłaty" })
        break
      case "accountant":
        if (status === "do opłaty")
          actions.push({ buttonLabel: "Oznacz jako opłacone", newStatus: "opłacone" })
        break
      default:
        break
    }
    return actions
  }

  const availableActions = useMemo(() => {
    if (!currentUser) return []
    return getAvailableActions(currentUser.role, selectedStatuses)
  }, [currentUser, selectedStatuses])

  /* ======================================================== Badges for Statuses ======================================================== */
  const getStatusBadge = (status) => {
    const colors = {
      "nowe": "badge-warning",
      "do potwierdzenia": "badge-accent",
      "do opłaty": "badge-info",
      "opłacone": "badge-success",
      "w drodze do biura": "badge-success",
      "w drodze na budowę": "badge-success",
      "otrzymane": "badge-neutral",
    }
    return colors[status] || "badge"
  }

  useEffect(() => {
    if (availableActions.length > 0) {
      setShowActions(true)
    } else {
      const timeout = setTimeout(() => setShowActions(false), 400)
      return () => clearTimeout(timeout)
    }
  }, [availableActions.length])

  if (loading) return <div className="flex justify-center items-center py-12"><ClipLoader color="#4d648d" size={50} /></div>
  if (error) return <div className="text-center py-12 text-error font-semibold">{error}</div>
  if (!localOrders.length) return <div className="text-center py-12 text-base-content/50">Brak zamówień do wyświetlenia</div>

  return (
    <div className="relative">
      <Toaster position="top-right" />

      {updating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <ClipLoader color="#4d648d" size={60} />
        </div>
      )}

      <div className="space-y-4 opacity-90 transition-opacity duration-300 ease-in-out">
        {/* Плавный блок с действиями */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showActions ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 py-0"}`}>
          <div className="flex flex-wrap items-center gap-4 transition-opacity duration-300 ease-in-out" style={{ opacity: showActions ? 1 : 0 }}>
            {/* Суммы по валютам */}
            {selectedOrders.some(id => {
              const order = localOrders.find(o => o.id === id)
              return order?.totalPrice && order?.currency
            }) && (
              <div className="bg-base-200 border rounded-md px-2 py-1 flex gap-4 items-center">
                {(() => {
                  const relevantOrders = localOrders.filter(o => selectedOrders.includes(o.id) && o.totalPrice && o.currency)
                  const totalByCurrency = relevantOrders.reduce((acc, o) => {
                    const totalPrice = parseFloat(o.totalPrice) || 0
                    if (!acc[o.currency]) acc[o.currency] = 0
                    acc[o.currency] += totalPrice
                    return acc
                  }, {})
                  return Object.entries(totalByCurrency).map(([currency, sum]) => (
                    <span key={currency} className="font-medium text-sm">
                      {sum.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
                    </span>
                  ))
                })()}
              </div>
            )}

            {/* Кнопки действий */}
            <div className="flex gap-2 flex-wrap">
              {availableActions.map((action) => {
                const selectedOrdersData = localOrders.filter(o => selectedOrders.includes(o.id))
                return (
                  <button key={action.newStatus} className={`btn btn-sm btn-accent ${selectedOrders.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`} disabled={updating || selectedOrders.length === 0}
                    onClick={async () => {
                      if (!currentUser) { toast.error("Nie znaleziono użytkownika"); return }
                      const { role, sub } = currentUser
                      if (!["admin", "order_manager", "approver", "accountant"].includes(role)) return toast.error("Brak uprawnień do zmiany statusów ❌")

                      const statusesRequiringPrice = ["do potwierdzenia", "do opłaty", "opłacone"]
                      if (statusesRequiringPrice.includes(action.newStatus)) {
                        const invalidOrders = selectedOrdersData.filter((o) => !o.pricePerUnit || parseFloat(o.pricePerUnit) <= 0)
                        if (invalidOrders.length > 0) return toast.error("Nie można zmienić statusu zamówienia bez ceny!")
                      }

                      setUpdating(true)
                      try {
                        const updatedIds = selectedOrders
                        await callGasApi("updateOrdersStatus", { ids: updatedIds, newStatus: action.newStatus, sub })
                        setLocalOrders(prev => prev.map(o =>
                          selectedOrders.includes(o.id) ? { ...o, status: action.newStatus, modifiedAt: new Date().toISOString(), modifiedBy: currentUser.name || "" } : o
                        ))
                        toast.success(`Wybrane zamówienia zostały zmienione na '${action.newStatus}' ✅`)
                        setSelectedOrders([])
                      } catch (err) {
                        console.error(err)
                        toast.error(err.message || "Błąd przy aktualizacji statusów ❌")
                      } finally {
                        setUpdating(false)
                      }
                    }}
                  >
                    {action.buttonLabel} ({selectedOrders.length})
                  </button>
                )
              })}

              {/* Кнопка "Odrzuć" */}
              <button className={`btn btn-sm btn-outline btn-error ${selectedOrders.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`} disabled={selectedOrders.length === 0 || updating}
                onClick={async () => {
                  if (!currentUser) return toast.error("Nie znaleziono użytkownika")
                  const { sub } = currentUser
                  setUpdating(true)
                  try {
                    const updatedIds = selectedOrders
                    await callGasApi("updateOrdersStatus", { ids: updatedIds, newStatus: "odrzucone", sub })
                    setLocalOrders(prev => prev.map(o =>
                      selectedOrders.includes(o.id) ? { ...o, status: "odrzucone", modifiedAt: new Date().toISOString(), modifiedBy: currentUser.name || "" } : o
                    ))
                    toast.success(`Wybrane zamówienia zostały oznaczone jako odrzucone ❌`)
                    setSelectedOrders([])
                  } catch (err) {
                    console.error(err)
                    toast.error(err.message || "Błąd przy odrzucaniu zamówień ❌")
                  } finally {
                    setUpdating(false)
                  }
                }}
              >
                Odrzuć wybrane
              </button>
            </div>
          </div>
        </div>


        <div className="overflow-x-auto transition-all duration-300 ease-in-out">
          <table className="table w-full">
            <thead>
              <tr>
                {enableFilters && (
                  <th>
                    <input type="checkbox" className="checkbox checkbox-primary rounded-md border-2 border-base-content scale-105" checked={selectedOrders.length === localOrders.length && localOrders.length > 0} onChange={toggleSelectAll}/>
                  </th>
                )}
                <th>Nazwa zamówienia</th>
                <th>Zamawiający</th>
                <th>Obiekt</th>
                {showMagazine && <th>Sklep</th>}
                <th>Ilość</th>
                <th className="text-right">Cena</th>
                <th className="text-right">Wartość</th>
                <th className="text-right">Termin</th>
                <th>Status</th>
                {showLink && <th>Link</th>}
                {showEditColumn && <th>Edytuj</th>}
              </tr>
            </thead>
            <tbody>
              {localOrders.map((order) => (
                <tr key={order.id} data-tgId={order.tgid} className="whitespace-nowrap transition-colors duration-200 bg-base-200 hover:bg-base-300">
                  {enableFilters && (
                    <th>
                      <input type="checkbox" className="checkbox rounded-md" checked={selectedOrders.includes(order.id)} onChange={() => toggleSelectOne(order.id)}/>
                    </th>
                  )}
                  <td className="max-w-[500px] whitespace-normal break-words overflow-hidden">{order.orderName || ""}</td>
                  <td>{order.createdBy || ""}</td>
                  <td>{order.object || ""}</td>
                  {showMagazine && <td>{order.store || ""}</td>}
                  <td className="text-right" onDoubleClick={() => {}}>{order.quantity || ""}</td>
                  <td className="text-right"
                    onDoubleClick={() => {
                      if (!enablePriceEdit) return
                      if (currentUser && ["admin", "order_manager"].includes(currentUser.role) && ["nowe", "do potwierdzenia"].includes(order.status)) { /* "stock_controller", */
                        setEditingPriceId(order.id)
                        setPriceInputValue(order.pricePerUnit || "")
                        if (!order.currency) setLocalOrders(prev => prev.map(o => o.id === order.id ? { ...o, currency: "PLN" } : o))
                      }
                    }}
                  >
                    {editingPriceId === order.id ? (
                      <input type="number" step="0.01" className="input input-sm w-20 text-right border-none focus:outline-none focus:ring-0" value={priceInputValue} autoFocus
                        onChange={(e) => setPriceInputValue(e.target.value)} onBlur={() => handlePriceSave(order)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handlePriceSave(order)
                          if (e.key === "Escape") setEditingPriceId(null)
                        }}
                      />
                    ) : order.pricePerUnit ? (parseFloat(order.pricePerUnit).toLocaleString("pl-PL", {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ` ${order.currency}`) : ("")}
                  </td>
                  <td className="text-right">{order.totalPrice ? parseFloat(order.totalPrice).toLocaleString("pl-PL", {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ` ${order.currency}` : ""}</td>
                  <td className="text-right">
                    {order.deadline ? (() => {
                      const d = new Date(order.deadline)
                      return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`
                    })() : ""}
                  </td>
                  <td><span className={`rounded-md badge px-2 py-0.5 text-sm ${getStatusBadge(order.status)}`}>{order.status}</span></td>
                  {showLink && (
                    <td>
                      {order.link ? (
                        <a href={order.link} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-outline btn-primary flex items-center justify-center gap-1.5 min-w-[90px]" onClick={(e) => e.stopPropagation()}>
                          Otwórz <FaExternalLinkAlt className="w-3.5 h-3.5" />
                        </a>
                      ) : ""}
                    </td>
                  )}
                  {showEditColumn && (
                    <td>
                      <button className="btn btn-xs btn-accent hover:bg-accent-focus flex items-center justify-center gap-1.5 min-w-[90px]" onClick={(e) => { e.stopPropagation(); navigate(`/orders/${order.id}`) }}>
                        Edytuj <FaPen className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            {showTfoot && (
              <tfoot>
                <tr className="bg-base-200 font-semibold text-base-content transition-colors duration-300">
                  <td colSpan={7}>Razem: {localOrders.length}</td>
                  <td className="text-right">
                    {Object.entries(
                      localOrders.reduce((acc, o) => {
                        if (!o.totalPrice || !o.currency) return acc
                        if (!acc[o.currency]) acc[o.currency] = 0
                        acc[o.currency] += parseFloat(o.totalPrice)
                        return acc
                      }, {})
                    ).map(([currency, sum]) => (
                      <div key={currency}>{sum.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}</div>
                    ))}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}

export default OrdersTable
