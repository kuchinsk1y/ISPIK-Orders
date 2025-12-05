import { useState, useCallback, useRef, useEffect } from "react"
import { FiChevronDown } from "react-icons/fi"
import { BiSortAZ, BiSortZA } from "react-icons/bi"
import { MdFilterAltOff } from "react-icons/md"
import { FaFilter } from "react-icons/fa"

const DropdownMultiSelect = ({ id, label, options, selected, setSelected, openDropdown, setOpenDropdown }) => {
  const isOpen = openDropdown === id

  const toggleOption = useCallback(
    (option) => setSelected(prev => prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]),
    [setSelected]
  )

  const handleToggle = () => setOpenDropdown(isOpen ? null : id)

  return (
    <div className="relative min-w-[180px]">
      <button type="button" onClick={handleToggle} className="btn w-full flex justify-between items-center h-10 border border-base-300 bg-base-100 focus:outline-none transition-colors duration-300">
        <span>{selected.length ? `${label} (${selected.length})` : label}</span>
        <FiChevronDown className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute mt-1 w-full bg-base-100 border border-base-300 rounded-md shadow-sm z-20 max-h-48 overflow-y-auto">
          {options.map((opt) => (
            <label key={opt} className="flex items-center px-3 py-2 hover:bg-base-200 cursor-pointer transition-colors duration-300">
              <input type="checkbox" className="checkbox checkbox-sm mr-2" checked={selected.includes(opt)} onChange={() => toggleOption(opt)} />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

const OrdersFilters = ({
  statusFilter, setStatusFilter,
  selectedObjects, setSelectedObjects,
  selectedCreatedBy, setSelectedCreatedBy,
  searchQuery, setSearchQuery,
  sortField, setSortField,
  sortDirection, setSortDirection,
  availableObjects, availableStatuses, availableCreatedBy,
  selectedMagazyn, setSelectedMagazyn, availableMagazyn,
  onApplyFilters, filterStorageKey, displayOrders,
  page, pageSize
}) => {
  const [openDropdown, setOpenDropdown] = useState(null)
  const filtersRef = useRef(null)

  const [statusDraft, setStatusDraft] = useState(statusFilter || [])
  const [objectsDraft, setObjectsDraft] = useState(selectedObjects || [])
  const [createdByDraft, setCreatedByDraft] = useState(selectedCreatedBy || [])
  const [magazynDraft, setMagazynDraft] = useState(selectedMagazyn || [])
  const [searchDraft, setSearchDraft] = useState(searchQuery || "")

  // Синхронизируем драфты с пропсами
  useEffect(() => setStatusDraft(statusFilter), [statusFilter])
  useEffect(() => setObjectsDraft(selectedObjects), [selectedObjects])
  useEffect(() => setCreatedByDraft(selectedCreatedBy), [selectedCreatedBy])
  useEffect(() => setMagazynDraft(selectedMagazyn), [selectedMagazyn])
  useEffect(() => setSearchDraft(searchQuery), [searchQuery])

  // Закрытие дропдаунов при клике вне
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target)) setOpenDropdown(null)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleApply = () => {
    setStatusFilter(statusDraft)
    setSelectedObjects(objectsDraft)
    setSelectedCreatedBy(createdByDraft)
    setSelectedMagazyn(magazynDraft)
    setSearchQuery(searchDraft)
    onApplyFilters()

    // сохраняем текущие фильтры + порядок заказов
    if (filterStorageKey) {
      const currentState = {
        statusFilter: statusDraft,
        selectedObjects: objectsDraft,
        selectedCreatedBy: createdByDraft,
        selectedMagazyn: magazynDraft,
        searchQuery: searchDraft,
        sortField,
        sortDirection,
        page,
        pageSize,
        displayOrders
      }
      localStorage.setItem(filterStorageKey, JSON.stringify(currentState))
    }

    setOpenDropdown(null)
  }

  const handleReset = () => {
    setStatusDraft([])
    setObjectsDraft([])
    setCreatedByDraft([])
    setMagazynDraft([])
    setSearchDraft("")
    setOpenDropdown(null)
    if (filterStorageKey) localStorage.removeItem(filterStorageKey)
  }

  return (
    <div ref={filtersRef} className="space-y-3 w-full">
      <div className="flex justify-between gap-3 items-center">
        <div className="flex gap-2">
          <select value={sortField} onChange={(e) => setSortField(e.target.value)} onFocus={() => setOpenDropdown(null)} className="transition-colors duration-300 select h-10 border border-base-300 bg-base-100 rounded-md w-[200px] focus:outline-none">
            <option value="createdAt">Domyślnie</option>
            <option value="deadline">Termin</option>
            <option value="orderName">Nazwa zamówienia</option>
            <option value="status">Status</option>
            <option value="object">Obiekt</option>
            <option value="createdBy">Zamawiający</option>
          </select>

          <button type="button" onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")} className="btn btn-square h-10 w-10 border border-base-300 bg-base-100 rounded-md transition-colors duration-300">
            {sortDirection === "asc" ? (<BiSortAZ size={18} />) : (<BiSortZA size={18} />)}
          </button>
        </div>

        <div className="flex gap-2">
          <button onClick={handleApply} className="btn h-10 border border-base-300 bg-base-100 flex items-center gap-2 rounded-md transition-colors duration-300">
            <FaFilter /> Zastosuj filtry
          </button>
          <button onClick={handleReset} className="btn h-10 border border-base-300 bg-base-100 flex items-center gap-2 rounded-md transition-colors duration-300">
            <MdFilterAltOff /> Wyczyść filtry
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-3 w-full">
        <input type="text" placeholder="🔍 Szukaj..." value={searchDraft} onChange={(e) => setSearchDraft(e.target.value)} onFocus={() => setOpenDropdown(null)} className="transition-colors duration-300 input h-10 border border-base-300 bg-base-100 rounded-md w-full focus:outline-none"/>
        <DropdownMultiSelect id="status" label="Status" options={availableStatuses} selected={statusDraft} setSelected={setStatusDraft} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown}/>
        <DropdownMultiSelect id="object" label="Obiekt" options={availableObjects} selected={objectsDraft} setSelected={setObjectsDraft} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown}/>
        <DropdownMultiSelect id="createdBy" label="Zamawiający" options={availableCreatedBy} selected={createdByDraft} setSelected={setCreatedByDraft} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown}/>
        <DropdownMultiSelect id="magazyn" label="Sklep" options={availableMagazyn} selected={magazynDraft} setSelected={setMagazynDraft} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown}/>
      </div>
    </div>
  )
}

export default OrdersFilters
