import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

const NewOrdersModal = ({ isOpen, onClose, onSave, projects = [] }) => {
  const [show, setShow] = useState(false)
  const [newOrder, setNewOrder] = useState({
    orderName: "",
    objectName: "",
    deadline: "",
    link: "",
    quantity: 1,
    address: "",
    notes: "",
  })

  useEffect(() => {
    if (isOpen) { setShow(true); document.body.style.overflow = "hidden" } 
    else { setShow(false); document.body.style.overflow = "auto" }
  }, [isOpen])

  if (!isOpen) return null

  const handleChange = (field, value) => setNewOrder(prev => ({ ...prev, [field]: value }))
  const handleClose = () => { setShow(false); setTimeout(() => onClose(), 200) }
  const handleSave = () => { onSave(newOrder); handleClose() }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-200 ${show ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={handleClose}
      ></div>
      <div
        className={`relative w-full max-w-3xl mx-3 p-6 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 transform transition-all duration-200 ${show ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}
      >
        <div className="flex items-center justify-between border-b border-gray-700 pb-3 mb-4">
          <h2 className="text-xl font-semibold text-white">Nowe zamówienie</h2>
          <button type="button" className="text-gray-400 hover:text-white transition" onClick={handleClose}>✕</button>
        </div>

        <form className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex flex-col">
              <label className="text-gray-300 text-sm mb-1">Nazwa zamówienia</label>
              <input type="text" value={newOrder.orderName} onChange={e => handleChange("orderName", e.target.value)} placeholder="Wpisz nazwę zamówienia" className="input input-bordered w-full"/>
            </div>
            <div className="flex-1 flex flex-col">
              <label className="text-gray-300 text-sm mb-1">Obiekt</label>
              <select value={newOrder.objectName} onChange={e => handleChange("objectName", e.target.value)} className="select select-bordered w-full">
                <option value="" disabled>Wybierz obiekt...</option>
                {projects.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex flex-col">
              <label className="text-gray-300 text-sm mb-1">Data do</label>
              <input type="date" value={newOrder.deadline} onChange={e => handleChange("deadline", e.target.value)} className="input input-bordered w-full"/>
            </div>
            <div className="flex-1 flex flex-col">
              <label className="text-gray-300 text-sm mb-1">Link</label>
              <input type="url" value={newOrder.link} onChange={e => handleChange("link", e.target.value)} placeholder="https://..." className="input input-bordered w-full"/>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex flex-col">
              <label className="text-gray-300 text-sm mb-1">Ilość</label>
              <input type="number" min="1" value={newOrder.quantity} onChange={e => handleChange("quantity", parseInt(e.target.value) || 1)} className="input input-bordered w-full"/>
            </div>
            <div className="flex-1 flex flex-col">
              <label className="text-gray-300 text-sm mb-1">Adres</label>
              <input type="text" value={newOrder.address} onChange={e => handleChange("address", e.target.value)} placeholder="Adres dostawy" className="input input-bordered w-full"/>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-gray-300 text-sm mb-1">Uwagi</label>
            <textarea value={newOrder.notes} onChange={e => handleChange("notes", e.target.value)} rows={3} placeholder="Dodaj dodatkowe informacje" className="textarea textarea-bordered w-full"/>
          </div>

          <div className="modal-action justify-end gap-3">
            <button type="button" className="btn btn-ghost" onClick={handleClose}>Anuluj</button>
            <button type="button" className="btn btn-primary" onClick={handleSave}>Zapisz</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

export default NewOrdersModal
