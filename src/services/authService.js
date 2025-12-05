import { callGasApi } from "../api/gasApi"

const STORAGE_KEY = "currentUser"

export function getSubFromUrl() {
  if (typeof window.SUB_FROM_URL === "undefined") {
    console.error("Sub не найден на фронте!")
    return null
  }
  return window.SUB_FROM_URL
}


export function decodeJwtPayload(token) {
  if (!token) return null
  try {
    const payloadPart = token.split(".")[1]
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/")
    return JSON.parse(atob(base64))
  } catch (e) {
    console.error("Ошибка декодирования токена:", e)
    return null
  }
}


export function getCurrentUserFromToken() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return null

  try {
    const token = JSON.parse(stored)
    const payload = decodeJwtPayload(token)
    if (!payload || payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    return {
      sub: payload.sub,
      role: payload.role,
      name: payload.name || "",
      email: payload.email || "",
      position: payload.position || "Brak stanowiska"
    }
  } catch (err) {
    console.error("Błąd dekodowania токена:", err)
    return null
  }
}



export function getCurrentUser() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return null

  const token = JSON.parse(stored)
  const payload = decodeJwtPayload(token)
  if (!payload || payload.exp < Math.floor(Date.now() / 1000)) {
    logoutUser()
    return null
  }

  return payload
}


export function logoutUser() {
  localStorage.removeItem(STORAGE_KEY)
}


export async function loginUserBySub() {
  const sub = getSubFromUrl()
  if (!sub) throw new Error("Nie znaleziono sub(id) użytkownika w interfejsie użytkownika")

  const response = await callGasApi("loginUser", sub)
  const { token } = response
  if (!token) throw new Error("Nie udało się uzyskać tokena")

  localStorage.removeItem(STORAGE_KEY)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(token))

  return decodeJwtPayload(token)
}
