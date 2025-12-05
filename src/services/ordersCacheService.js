import { getOrdersData } from "./ordersService"

const FIVE_MINUTES = 3 * 60 * 1000

let cachedData = null
let lastFetch = 0

export const fetchOrdersWithCache = async (onUpdate) => {
  const now = Date.now()

  if (cachedData) {
    if (now - lastFetch > FIVE_MINUTES) {
      getOrdersData().then((fresh) => {
        cachedData = fresh
        lastFetch = Date.now()
        if (onUpdate) onUpdate(fresh)
      }).catch(err => console.error("Background refresh error:", err))
    }
    return cachedData
  }

  const data = await getOrdersData()
  cachedData = data
  lastFetch = now
  return data
}
