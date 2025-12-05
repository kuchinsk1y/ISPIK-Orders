import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import PageTransition from "../../components/ui/PageTransition"
import OrdersTable from "../../components/orders/OrdersTable"
import OrdersFilters from "../../components/orders/OrdersFilters"
import OrdersCards from "../../components/orders/OrdersCards.jsx"
import { getOrdersData, getUniqueCreatedBy } from "../../services/ordersService"
import { getCurrentUser } from "../../services/authService"
import { FaPlusCircle, FaChevronLeft, FaChevronRight } from "react-icons/fa"
import { LiaMoneyBillWaveSolid } from "react-icons/lia"
import { LuListChecks } from "react-icons/lu"
import { FiUsers } from "react-icons/fi"
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md"
import { ClipLoader } from "react-spinners"

const PAGE_SIZES = [25, 50, 75, 100]

const FIXED_STATUSES = ["nowe", "do potwierdzenia", "do opłaty", "opłacone", "w drodze do biura", "w drodze na budowę", "na magazynie", "otrzymane", "do wyjaśnienia", "anulowane", "odrzucone", "błędne"]

const STORAGE_KEY = "currentUser"
const FILTERS_STORAGE_KEY = "ordersFilters";

const Orders = () => {
  const navigate = useNavigate()
  const [selectedMagazyn, setSelectedMagazyn] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [orders, setOrders] = useState([])
  const [displayOrders, setDisplayOrders] = useState([])
  const [projects, setProjects] = useState([])
  const [availableCreatedBy, setAvailableCreatedBy] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalOrders, setTotalOrders] = useState(0)

  const [statusFilter, setStatusFilter] = useState([])
  const [selectedObjects, setSelectedObjects] = useState([])
  const [selectedCreatedBy, setSelectedCreatedBy] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState("createdAt")
  const [sortDirection, setSortDirection] = useState("asc")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [allMagazyn, setAllMagazyn] = useState([])
  const [roleFilterApplied, setRoleFilterApplied] = useState(false)

  useEffect(() => {
    const savedFilters = sessionStorage.getItem(FILTERS_STORAGE_KEY)
    if (savedFilters) {
      const {
        statusFilter,
        selectedObjects,
        selectedCreatedBy,
        selectedMagazyn,
        searchQuery,
        sortField,
        sortDirection,
        page,
        pageSize,
        displayOrders: savedDisplayOrders,
      } = JSON.parse(savedFilters)

      if (statusFilter) setStatusFilter(statusFilter)
      if (selectedObjects) setSelectedObjects(selectedObjects)
      if (selectedCreatedBy) setSelectedCreatedBy(selectedCreatedBy)
      if (selectedMagazyn) setSelectedMagazyn(selectedMagazyn)
      if (searchQuery) setSearchQuery(searchQuery)
      if (sortField) setSortField(sortField)
      if (sortDirection) setSortDirection(sortDirection)
      if (page) setPage(page)
      if (pageSize) setPageSize(pageSize)
      if (savedDisplayOrders) setDisplayOrders(savedDisplayOrders)
    }
  }, [])

  // ------------------- Load current user and filter for approver -------------------
  // useEffect(() => {
  //   const user = getCurrentUser()
  //   if (user) {
  //     setCurrentUser(user)
  //     if (user.role === "approver") {
  //       setStatusFilter(["do potwierdzenia"])
  //     } else if (user.role === "accountant") {
  //       setStatusFilter(["do opłaty"])
  //     }
  //   }
  //   setRoleFilterApplied(true)
  // }, [])

  useEffect(() => {
    const savedFilters = sessionStorage.getItem(FILTERS_STORAGE_KEY)

    const user = getCurrentUser()
    if (user) setCurrentUser(user)

    if (!savedFilters && user) {
      if (user.role === "approver") setStatusFilter(["do potwierdzenia"])
      else if (user.role === "accountant") setStatusFilter(["do opłaty"])
    }

    setRoleFilterApplied(true)
  }, [])

  // ------------------- Load unique creators -------------------
  useEffect(() => {
    const loadCreatedBy = async () => {
      const names = await getUniqueCreatedBy()
      setAvailableCreatedBy(names)
    }
    loadCreatedBy()
  }, [])

  // ------------------- Load orders -------------------
  useEffect(() => {
    if (!roleFilterApplied) return
    const fetchOrders = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getOrdersData({
          page,
          pageSize,
          search: searchQuery,
          status: statusFilter,
          objects: selectedObjects,
          createdBy: selectedCreatedBy,
          store: selectedMagazyn,
        });

        // console.log("Полученные заказы: createdAt", data.orders.map(o => o.createdAt));
        // console.log("Полученные заказы:", data);

        // const mappedOrders = data.orders.map((o, i) => ({id: i + 1 + (page - 1) * pageSize, ...o,}))

        const mappedOrders = data.orders.map((o, i) => {
          let createdAtDate = o.createdAt
          if (typeof createdAtDate === "string" && createdAtDate.startsWith("Date(")) {
            const parts = createdAtDate.replace("Date(", "").replace(")", "").split(",").map(p => parseInt(p, 10))
            createdAtDate = new Date(parts[0], parts[1], parts[2], parts[3], parts[4], parts[5])
          }

          const formattedCreatedAt = createdAtDate.toISOString().slice(0, 19).replace("T", " ")

          return {id: i + 1 + (page - 1) * pageSize, ...o, createdAt: createdAtDate, formattedCreatedAt}
        })

        setOrders(mappedOrders)
        setDisplayOrders(mappedOrders)
        setProjects(data.projects || [])
        setTotalOrders(data.total || data.orders.length)
      } catch (err) {
        console.error(err)
        setError(err.message || "Błąd przy ładowaniu zamówień.")
        setOrders([])
        setDisplayOrders([])
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [page, pageSize, statusFilter, selectedObjects, selectedCreatedBy, searchQuery, selectedMagazyn, roleFilterApplied])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, selectedObjects, selectedCreatedBy, searchQuery, selectedMagazyn])

  const availableObjects = useMemo(() => {
    const objs = projects.map((p) => p.project)

    const defaults = ["Serwis", "Magazyn (Biuro)"]
    defaults.forEach((d) => {
      if (!objs.includes(d)) objs.push(d)
    })

    return objs.sort((a, b) => a.localeCompare(b))
  }, [projects])

  const sortedOrders = useMemo(() => {
    if (!sortField) return displayOrders
    return [...displayOrders].sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (sortField === "createdAt") return sortDirection === "asc" ? aVal - bVal : bVal - aVal
      if (typeof aVal === "string" && typeof bVal === "string") return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      return sortDirection === "asc" ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1
    })
  }, [displayOrders, sortField, sortDirection])

  useEffect(() => {
    const fetchAllMagazyn = async () => {
      try {
        const data = await getOrdersData({ page: 1, pageSize: 10000 })
        const unique = Array.from(new Set(data.orders.map(o => o.store).filter(Boolean)))
        if (!unique.includes("inny")) unique.push("inny")
        setAllMagazyn(unique)
      } catch (err) {
        console.error(err)
      }
    }
    fetchAllMagazyn()
  }, [])

  useEffect(() => {
    const filtersToSave = {
      statusFilter,
      selectedObjects,
      selectedCreatedBy,
      selectedMagazyn,
      searchQuery,
      page,
      pageSize,
      sortField,
      sortDirection,
      displayOrders,
    }
    sessionStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filtersToSave))
  }, [statusFilter, selectedObjects, selectedCreatedBy, selectedMagazyn, searchQuery, page, pageSize, sortField, sortDirection, displayOrders]);



  const stats = useMemo(() => {
    // Считаем сумму по totalPrice для каждой валюты
    const totalsByCurrency = orders.reduce((acc, o) => {
      if (!o.totalPrice || !o.currency) return acc
      const totalPrice = parseFloat(o.totalPrice.toString().replace(/[^\d.-]/g, "")) || 0
      const currency = o.currency
      if (!acc[currency]) acc[currency] = 0
      acc[currency] += totalPrice
      return acc
    }, {})

    /*

    const totalsByCurrency = orders.reduce((acc, o) => {
      if (!o.totalPrice || !o.currency) return acc
      const totalPrice = parseFloat(o.totalPrice.toString().replace(/[^\d.-]/g, "")) || 0
      if (!acc[o.currency]) acc[o.currency] = 0
      acc[o.currency] += totalPrice
      return acc
    }, {})

    */

    const statusCounts = {}
    const clientsCount = {}
    orders.forEach((o) => {
      if (o.status) statusCounts[o.status] = (statusCounts[o.status] || 0) + 1
      if (o.createdBy) clientsCount[o.createdBy] = (clientsCount[o.createdBy] || 0) + 1
    })
    const uniqueClients = Object.keys(clientsCount)

    return [
      {
        title: "Suma zamówień",
        icon: <LiaMoneyBillWaveSolid />,
        children: (
          <div className="flex flex-col gap-1">
            {Object.entries(totalsByCurrency).map(([currency, sum]) => (
              <div key={currency}>
                {sum.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
              </div>
            ))}
          </div>
        ),
      },
      {
        title: "Statusy zamówień",
        icon: <LuListChecks />,
        children: (
          <div className="flex flex-col gap-1 text-sm">
            {FIXED_STATUSES.filter((status) => (statusCounts[status] ?? 0) > 0).map((status) => (
              <div key={status}>{status.charAt(0).toUpperCase() + status.slice(1)}: {statusCounts[status]}</div>
            ))}
          </div>
        ),
      },
      {
        title: "Klienci",
        icon: <FiUsers />,
        children: (
          <div className="flex flex-col gap-1 text-sm">
            {uniqueClients.map((client, i) => (
              <div key={i}>{client}: {clientsCount[client]}</div>
            ))}
          </div>
        ),
      },
    ]
  }, [orders])

  const totalPages = Math.ceil(totalOrders / pageSize)

  const renderPaginationButtons = () => {
    const maxButtons = 4
    let start = Math.max(page - 1, 1)
    let end = start + maxButtons - 1
    if (end > totalPages) {
      end = totalPages
      start = Math.max(end - maxButtons + 1, 1)
    }
    const pages = []
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }

  const paginationPages = renderPaginationButtons()

  return (
    <PageTransition className="space-y-4">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Zamówienia</h2>
          {currentUser && (currentUser.role === "admin" || currentUser.role === "order_manager") && (
            <button className="btn btn-primary btn-sm flex items-center gap-2" onClick={() => navigate("/orders/new")}>
              <FaPlusCircle className="w-4 h-4" /> Dodaj nowe
            </button>
          )}
        </div>

        <OrdersFilters statusFilter={statusFilter} setStatusFilter={setStatusFilter} selectedObjects={selectedObjects} setSelectedObjects={setSelectedObjects} selectedCreatedBy={selectedCreatedBy} setSelectedCreatedBy={setSelectedCreatedBy} searchQuery={searchQuery} setSearchQuery={setSearchQuery} sortField={sortField} setSortField={setSortField} sortDirection={sortDirection} setSortDirection={setSortDirection} availableObjects={availableObjects} availableStatuses={FIXED_STATUSES} availableCreatedBy={availableCreatedBy} selectedMagazyn={selectedMagazyn} setSelectedMagazyn={setSelectedMagazyn} availableMagazyn={allMagazyn} onApplyFilters={() => setPage(1)} filterStorageKey={FILTERS_STORAGE_KEY} displayOrders={displayOrders}/>

        <hr className="border border-base-300 bg-base-100" />

        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-1 flex-wrap">
            <button className="btn btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><MdArrowBackIos /></button>
            {paginationPages[0] > 1 && <span className="px-2">...</span>}
            {paginationPages.map((pNum) => (
              <button key={pNum} className={`btn btn-sm ${page === pNum ? "btn-active" : ""}`} onClick={() => setPage(pNum)}>{pNum}</button>
            ))}
            {paginationPages[paginationPages.length - 1] < totalPages && <span className="px-2">...</span>}
            <button className="btn btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><MdArrowForwardIos /></button>
          </div>


          <div className="flex items-center gap-2 text-sm">
            <span>Ilość wyświetlanych wierszy:</span>
            <select value={pageSize} onChange={(e) => {
              const newSize = Number(e.target.value)
              setPageSize(newSize)
              const newTotalPages = Math.ceil(totalOrders / newSize)
              setPage((prev) => (prev > newTotalPages ? newTotalPages : 1))
            }} className="select select-sm w-20 border border-base-300 bg-base-100 rounded-md focus:outline-none">
              {PAGE_SIZES.map((size) => (<option key={size} value={size}>{size}</option>))}
            </select>

            <button className="btn btn-sm btn-outline flex border border-base-300 bg-base-100 items-center gap-1" onClick={() => setIsSidebarOpen((prev) => !prev)}>
              {isSidebarOpen ? <FaChevronRight /> : <FaChevronLeft />}
            </button>
          </div>
        </div>

        <hr className="border border-base-300 bg-base-100" />

        <div className="flex gap-2 relative">
          <div className="flex-1 overflow-x-auto transition-opacity duration-500 ease-in-out" style={{ opacity: loading || !roleFilterApplied ? 0.5 : 1 }}>
            {(!roleFilterApplied || loading) ? (
              <div className="flex justify-center items-center py-12">
                <ClipLoader color="#4d648d" size={50} />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-error font-semibold">{error}</div>
            ) : sortedOrders.length === 0 ? (
              <div className="text-center py-12 text-base-content/50">Brak zamówień do wyświetlenia</div>
            ) : (
              <OrdersTable orders={sortedOrders} loading={loading} error={error} enableRowClick={true} />
            )}
          </div>

          <div className={`flex flex-col gap-4 transition-all duration-300 overflow-hidden`} style={{ width: isSidebarOpen ? "320px" : "0px" }}>
            <div className={`flex flex-col gap-4 ${isSidebarOpen ? "opacity-100" : "opacity-0"}`}>
              {stats.map((s, i) => (<OrdersCards key={i} {...s} />))}
            </div>
          </div>
        </div>

        {displayOrders.length >= 20 && totalOrders > pageSize && (
          <div>
            <hr className="border border-base-300 bg-base-100 mb-3" />
            <div className="flex justify-start items-center flex-wrap gap-2 mt-2">
              <button className="btn btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><MdArrowBackIos /></button>
              {paginationPages[0] > 1 && <span className="px-2">...</span>}
              {paginationPages.map((pNum) => (
                <button key={pNum} className={`btn btn-sm ${page === pNum ? "btn-active" : ""}`} onClick={() => setPage(pNum)}>{pNum}</button>
              ))}
              {paginationPages[paginationPages.length - 1] < totalPages && <span className="px-2">...</span>}
              <button className="btn btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><MdArrowForwardIos /></button>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}

export default Orders
