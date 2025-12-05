import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState, useMemo, useRef } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import toast, { Toaster } from "react-hot-toast"
import { ClipLoader } from "react-spinners"
import { callGasApi } from "../../../api/gasApi"
import { getOrdersData, getOrderById } from "../../../services/ordersService"
import { decodeJwtPayload } from "../../../services/authService"
import { MdArrowBackIos } from "react-icons/md"

import InputField from "../../../components/ui/InputField"
import SelectField from "../../../components/ui/SelectField"
import { ORDER_STATUSES, CURRENCIES, STORAGE_KEYS, DEFAULT_OBJECTS } from "../../../constants"
import TextAreaField from "../../../components/ui/TextAreaField"
import MagazynInput from "../../../components/ui/StoreInput"
import { normalizeDeadline, formatDateForSheet, prepareOrderToSend } from "../../../utils"

// ------------------ SCHEMA ------------------
const orderSchema = yup.object().shape({
  orderName: yup.string().required("Nazwa zamówienia jest wymagana"),
  object: yup.string().required("Obiekt jest wymagany"),
  deadline: yup.string().required("Pożądana data dostawy jest wymagana"),
  quantity: yup.number().min(1, "Ilość musi być większa niż 0").required("Ilość jest wymagana"),
  address: yup.string().required("Adres dostawy jest wymagany"),
  pricePerUnit: yup.string().required("Cena jest wymagana")
  .test("is-positive", "Cena musi być większa niż 0", (value) => {
    if (!value) return false
    const numberValue = parseFloat(value.replace(",", "."))
    return !isNaN(numberValue) && numberValue > 0
  }),
  currency: yup.string().oneOf(["PLN", "EUR", "USD"]).required("Wybierz walutę"),
  link: yup.string().url("Nieprawidłowy format linku").nullable(),
  store: yup.string().required("Sklep jest wymagany"),
  note: yup.string().nullable(),
  status: yup.string().default("nowe").required("Status jest wymagany").oneOf([
    "nowe", "do potwierdzenia", "do opłaty", "opłacone", "w drodze do biura", "w drodze na budowę", "na magazynie", "otrzymane", "do wyjaśnienia", "anulowane", "odrzucone"
  ],"Status jest wymagany"),
})

// ------------------ COMPONENT ------------------
const OrderFormPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [initialStatus, setInitialStatus] = useState("")
  const [updating, setUpdating] = useState(false)
  const [orders, setOrders] = useState([])
  const [order, setOrder] = useState(null)

  const { register, handleSubmit, reset, watch, setValue, control, formState: { errors, isDirty } } = useForm({
    resolver: yupResolver(orderSchema),
    defaultValues: {
      orderName: "",
      object: "",
      deadline: "",
      quantity: 0,
      address: "",
      pricePerUnit: 0,
      currency: "PLN",
      link: "",
      note: "",
      status: "nowe",
      createdAt: "",
      modifiedAt: "",
      store: "",
      totalPrice: ""
    },
  })

  const quantity = watch("quantity")
  const pricePerUnit = watch("pricePerUnit")
  const totalPrice = watch("totalPrice")

  const lastChanged = useRef(null) // "quantity", "price", "total"

  useEffect(() => {
    const qty = parseFloat(quantity) || 0
    const price = parseFloat(String(pricePerUnit).replace(",", ".")) || 0
    const total = parseFloat(String(totalPrice).replace(",", ".")) || 0

    if (lastChanged.current === "quantity" || lastChanged.current === "price") {
      if (!isNaN(qty) && !isNaN(price)) {
        const newTotal = (qty * price).toFixed(2)
        if (newTotal !== total.toFixed(2)) setValue("totalPrice", newTotal, { shouldValidate: true })
      } else {
        setValue("totalPrice", "", { shouldValidate: true })
      }
      lastChanged.current = null
    }

    if (lastChanged.current === "total") {
      if (!isNaN(qty) && qty > 0 && !isNaN(total)) {
        const newPrice = (total / qty).toFixed(2)
        if (newPrice !== price.toFixed(2)) setValue("pricePerUnit", newPrice, { shouldValidate: true })
      }
      lastChanged.current = null
    }
  }, [quantity, pricePerUnit, totalPrice, setValue])

  // const handleQuantityChange = (e) => {
  //   lastChanged.current = "quantity"
  //   setValue("quantity", e.target.value)
  // }

  // const handlePriceChange = (e) => {
  //   lastChanged.current = "price"
  //   setValue("pricePerUnit", e.target.value)
  // }

  // const handleTotalChange = (e) => {
  //   lastChanged.current = "total"
  //   setValue("totalPrice", e.target.value)
  // }

  const currentStatus = watch("status")

  // ------------------ LOAD CURRENT USER ------------------
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.currentUser)
    if (stored) {
      try {
        const token = JSON.parse(stored)
        const decoded = decodeJwtPayload(token)
        if (decoded) setCurrentUser(decoded)
      } catch (err) {
        console.error("Błąd dekodowania tokenu:", err)
      }
    }
  }, [])

  // ------------------ LOAD PROJECTS & ORDERS ------------------
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { projects, orders } = await getOrdersData({ page:1, pageSize:100 })
        setProjects(Array.isArray(projects) ? projects : [])
        setOrders(Array.isArray(orders) ? orders : [])
      } catch (err) {
        console.error(err)
        toast.error("Błąd przy pobieraniu projektów")
      }
    }
    fetchProjects()
  }, [])

  // ------------------ LOAD ORDER ------------------
  useEffect(() => {
    if (!id || id === "new") return

    const fetchOrderAndSet = async () => {
      try {
        const fetchedOrder = await getOrderById(id)
        if (!fetchedOrder) return
        setOrder(fetchedOrder)

        if (!fetchedOrder) return
        if (projects.length === 0) return

        reset({
          ...fetchedOrder,
          object: objectOptions.includes(fetchedOrder.object) ? fetchedOrder.object : "",
          deadline: normalizeDeadline(fetchedOrder.deadline),
          status: fetchedOrder.status || "nowe",
        })
        setInitialStatus(fetchedOrder.status || "nowe")
      } catch (err) {
        console.error(err)
        toast.error("Błąd przy pobieraniu zamówienia")
      }
    }

    fetchOrderAndSet()
  }, [id, projects, reset])

  // ------------------ OBJECT OPTIONS ------------------
  const objectOptions = useMemo(() => {
    if (!projects) return DEFAULT_OBJECTS
    const objs = projects.map(p => p.project)
    const defaults = DEFAULT_OBJECTS
    defaults.forEach(d => {
      if (!objs.includes(d)) objs.push(d)
    })
    return objs.sort((a, b) => a.localeCompare(b))
  }, [projects])


  // ------------------ STATUS OPTIONS ------------------
  const statusOptions = (() => {
    const allStatuses = ORDER_STATUSES
    if (!currentUser) return ["nowe"]
    const role = currentUser.role

    if (!id || id === "new") {
      if (role === "admin") return allStatuses
      return ["nowe"]
    }

    const initial = initialStatus
    switch(role) {
      case "admin": return allStatuses
      case "order_manager":
        if(initial==="nowe") return ["nowe","odrzucone","do potwierdzenia"]
        if(initial==="do potwierdzenia") return ["do potwierdzenia","anulowane"]
        if(initial==="do opłaty") return ["do opłaty","anulowane"]
        if(initial==="opłacone") return ["opłacone","w drodze do biura","w drodze na budowę","na magazynie"]

        if (initial === "na magazynie") return ["na magazynie", "w drodze do biura", "w drodze na budowę"]
        if (initial === "do wyjaśnienia") return ["do wyjaśnienia", "błędne"]

        return [currentStatus]
      case "approver":
        if(initial==="do potwierdzenia") return ["do potwierdzenia","odrzucone","do opłaty"]
        return [currentStatus]
      case "accountant":
        if(initial==="do opłaty") return ["do opłaty","odrzucone","opłacone"]
        return [currentStatus]
      case "stock_controller":
        if(initial==="nowe") return ["nowe","na magazynie"]
      default: return [currentStatus]
    }
  })()

  // ------------------ READ ONLY ------------------
  const isReadOnly = (() => {
    if (!currentUser) return false
    const role = currentUser.role
    const status = currentStatus
    if(role==="admin") return false
    /* na magazynie */
    if(role==="order_manager" && ["nowe","do potwierdzenia"].includes(status)) return false
    return true
  })()

  // ------------------ MAGAZYN OPTIONS ------------------
  const magazynOptions = useMemo(() => {
    if (!orders || orders.length === 0) return ["inny"]
    const unique = Array.from(new Set(orders.map(o => o.store).filter(Boolean)))
    if (!unique.includes("inny")) unique.push("inny")
    return unique
  }, [orders])

  // ------------------ ON SUBMIT ------------------
  const onSubmit = async (data) => {
    try {
      setUpdating(true)
      const isNewOrder = !id || id === "new"
      const sub = currentUser?.sub
      if (!sub) throw new Error("Nie znaleziono sub użytkownika")

      const orderToSend = {...prepareOrderToSend(data, currentUser, isNewOrder), sub}

      const savePromise = isNewOrder ? callGasApi("addOrders", [{ ...orderToSend, tgid: orderToSend.tgid || null }]) : callGasApi("updateOrders", [{ ...orderToSend, tgid: order?.tgid || null }])

      await toast.promise(
        savePromise,
        {
          loading: isNewOrder ? "Zapisywanie zamówienia..." : "Zapisywanie zmian...",
          success: isNewOrder ? "Dodano zamówienie!" : "Zmieniono zamówienie!",
          error: (err) => err.message || "Błąd podczas zapisu 😕",
        },
        { style:{ borderRadius:"8px", background:"#637fa4", color:"#fff" } }
      )

      setTimeout(() => navigate("/orders"), 1000)
    } catch(err) {
      console.error(err)
      toast.error(err.message || "Błąd podczas zapisu")
    } finally {
      setUpdating(false)
    }
  }

  // ------------------ RENDER ------------------
  return (
    <div className="space-y-4 relative">
      {updating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <ClipLoader color="#ffffff" size={60} />
        </div>
      )}

      <Toaster position="top-right" />

      <button className="btn btn-outline mb-3 flex items-center gap-2 rounded-md" onClick={() => navigate("/orders")}>
        <MdArrowBackIos className="text-lg" />
        <span>Do zamówień</span>
      </button>

      <h2 className="text-2xl font-bold">{id && id !== "new" ? "Edytuj zamówienie" : "Dodaj zamówienie"}</h2>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Nazwa zamówienia" registerProps={register("orderName")} error={errors.orderName?.message} disabled={isReadOnly}/>
          <SelectField label="Obiekt" registerProps={register("object")} options={objectOptions} placeholder="Wybierz obiekt..." error={errors.object?.message} disabled={isReadOnly}/>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField label="Status" placeholder="Wybierz status..." registerProps={register("status")} options={statusOptions} error={errors.status?.message}/>
          <InputField label="Termin otrzymania (najpóźniej do)" type="date" registerProps={register("deadline")} error={errors.deadline?.message} disabled={isReadOnly}/>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Controller name="quantity" control={control}
            render={({ field }) => (
              <InputField label="Ilość" type="number"
                {...field}
                onChange={(e) => {
                  field.onChange(e)
                  lastChanged.current = "quantity"
                }}
                error={errors.quantity?.message} disabled={isReadOnly}
              />
            )}
          />

          <Controller name="pricePerUnit" control={control}
            render={({ field }) => (
              <InputField label="Cena jedn." type="text"
                {...field}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9,]/g, "")
                  field.onChange(value)
                  lastChanged.current = "price"
                }} error={errors.pricePerUnit?.message} disabled={isReadOnly}
              />
            )}
          />

          <Controller name="totalPrice" control={control}
            render={({ field }) => (
              <InputField label="Wartość" type="text"
                {...field}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9,]/g, "")
                  field.onChange(value)
                  lastChanged.current = "total"
                }} error={errors.totalPrice?.message} disabled={isReadOnly}
              />
            )}
          />

          <SelectField label="Waluta" registerProps={register("currency")}
            options={CURRENCIES}
            error={errors.currency?.message}
            disabled={isReadOnly}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Adres dostawy lub nr. paczkomatu" registerProps={register("address")} error={errors.address?.message} disabled={isReadOnly}/>
          <div className="flex gap-2">
            <MagazynInput register={register} options={magazynOptions} error={errors.store?.message} disabled={isReadOnly} className="flex-1"/>
            <InputField label="Link" registerProps={register("link")} error={errors.link?.message} disabled={isReadOnly} className="flex-1"/>
          </div>
        </div>

        <TextAreaField label="Dodatkowe informacje" registerProps={register("note")} placeholder="Dodatkowe informacje" rows={3} error={errors.note?.message} disabled={isReadOnly}/>

        <div className="flex justify-end">
          <button type="submit" disabled={(isReadOnly && !isDirty) || (!isDirty && id !== "new")} className={`mt-4 px-6 py-2 rounded-md border border-base-400 bg-base-100 text-base-content font-medium transition-all duration-200 shadow-sm ${(isReadOnly && !isDirty) || (!isDirty && id !== "new") ? "opacity-60 cursor-not-allowed" : "hover:bg-base-200 hover:shadow-md"}`}>Zapisz</button>
        </div>
      </form>
    </div>
  )
}

export default OrderFormPage

