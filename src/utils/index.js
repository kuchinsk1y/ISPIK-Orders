// Утилиты, вынесенные без изменений логики

// --- OrderFormPage helpers ---
export const normalizeDeadline = (d) => {
  if (!d) return ""
  const date = new Date(d)
  if (isNaN(date)) return ""
  const pad = (n) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export const formatDateForSheet = (d) => {
  if (!d) return ""
  const date = new Date(d)
  if (isNaN(date)) return ""
  const pad = (n) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export const prepareOrderToSend = (data, currentUser, isNew) => {
  const now = new Date()
  const pricePerUnit = Math.round((parseFloat(String(data.pricePerUnit).replace(",", ".")) || 0) * 100) / 100
  const quantity = parseInt(data.quantity, 10) || 0
  const totalPrice = Math.round(pricePerUnit * quantity * 100) / 100

  return {
    ...data,
    pricePerUnit,
    quantity,
    totalPrice,
    currency: data.currency || "PLN",
    createdAt: isNew ? formatDateForSheet(now) : formatDateForSheet(data.createdAt),
    modifiedAt: formatDateForSheet(now),
    createdBy: isNew ? currentUser?.name || "" : data.createdBy,
    modifiedBy: currentUser?.name || "",
    deadline: data.deadline || "",
    userName: currentUser?.name || ""
  }
}

// --- OrdersChart helpers ---
export function parseDateString(str) {
  if (!str) return null;
  if (typeof str === "string" && str.startsWith("Date(")) {
    const parts = str
      .replace("Date(", "")
      .replace(")", "")
      .split(",")
      .map((p) => parseInt(p, 10));
    return new Date(
      parts[0],
      parts[1],
      parts[2],
      parts[3] || 0,
      parts[4] || 0,
      parts[5] || 0
    );
  }
  return new Date(str);
}

// --- Theme helpers ---
export const initThemeFromStorage = (themeKey, defaultTheme) => {
  try {
    const savedTheme = localStorage.getItem(themeKey)
    if (!savedTheme) {
      localStorage.setItem(themeKey, defaultTheme)
      document.documentElement.setAttribute("data-theme", defaultTheme)
    } else {
      document.documentElement.setAttribute("data-theme", savedTheme)
    }
  } catch (_) {
    document.documentElement.setAttribute("data-theme", defaultTheme)
  }
}
