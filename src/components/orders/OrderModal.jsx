import { useEffect, useState } from "react"
import ReactDOM from "react-dom"

const OrderModal = ({ order, onClose, projects = [] }) => {
  const [show, setShow] = useState(false)
  const [editedOrder, setEditedOrder] = useState({})

  useEffect(() => {
    if (order === undefined) return
    setEditedOrder(order || {})
    setShow(true)
  }, [order])

  const handleClose = () => {
    setShow(false)
    setTimeout(() => onClose(), 200)
  }

  const handleInputChange = (field, value) => setEditedOrder((prev) => ({ ...prev, [field]: value }))

  if (order === undefined) return null

  return ReactDOM.createPortal(
    <div className={`fixed inset-0 z-50 flex justify-center items-start w-full h-full bg-black/30 backdrop-blur-sm overflow-y-auto transition-opacity duration-300 ${show ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <div className={`modal-box relative max-w-3xl p-6 bg-base-200 dark:bg-base-900 border border-base-300 rounded-2xl mt-24 mx-3 transform transition-all duration-200 ${show ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}>
        <h3 className="text-lg font-bold mb-4">{order ? "Edytuj zamówienie" : "Dodaj zamówienie"}</h3>
        <button type="button" className="btn btn-sm btn-ghost absolute top-3 right-3" onClick={handleClose}>✕</button>

        <form className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex flex-col">
              <label className="label-text">Nazwa zamówienia</label>
              <input type="text" value={editedOrder.orderName || ""} onChange={(e) => handleInputChange("orderName", e.target.value)} placeholder="Wpisz nazwę zamówienia" className="input input-bordered w-full"/>
            </div>
            <div className="flex-1 flex flex-col">
              <label className="label-text">Obiekt</label>
              <select value={editedOrder.object || ""} onChange={(e) => handleInputChange("object", e.target.value)} className="select select-bordered w-full">
                <option value="" disabled>Wybierz obiekt...</option>
                {projects.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex flex-col">
              <label className="label-text">Data do</label>
              <input type="date" value={editedOrder.deadline || ""} onChange={(e) => handleInputChange("deadline", e.target.value)} className="input input-bordered w-full"/>
            </div>
            <div className="flex-1 flex flex-col">
              <label className="label-text">Link</label>
              <input type="url" value={editedOrder.link || ""} onChange={(e) => handleInputChange("link", e.target.value)} placeholder="https://..." className="input input-bordered w-full"/>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex flex-col">
              <label className="label-text">Ilość</label>
              <input type="number" value={editedOrder.quantity || ""} onChange={(e) => handleInputChange("quantity", parseInt(e.target.value) || 0)} placeholder="0" className="input input-bordered w-full"/>
            </div>
            <div className="flex-1 flex flex-col">
              <label className="label-text">Adres</label>
              <input type="text" value={editedOrder.address || ""} onChange={(e) => handleInputChange("address", e.target.value)} placeholder="Adres dostawy" className="input input-bordered w-full"/>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="label-text">Uwagi</label>
            <textarea value={editedOrder.note || ""} onChange={(e) => handleInputChange("note", e.target.value)} placeholder="Dodatkowe informacje" rows={3} className="textarea textarea-bordered w-full"/>
          </div>

          <div className="modal-action justify-end gap-3">
            <button type="button" className="btn btn-ghost" onClick={handleClose}>Anuluj</button>
            <button type="submit" className="btn btn-primary">Zapisz</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

export default OrderModal
