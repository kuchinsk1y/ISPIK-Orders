
function responseToObjects(res) {
  try {
    const json = JSON.parse(res.substring(47).slice(0, -2))
    if (json.status === "error") return { status: "error", error: json.errors }

    const data = []
    if (json.table.cols[0].label === "") {
      for (const cl in json.table.cols) json.table.cols[cl].label = json.table.rows[0]["c"][cl]["v"]
      json.table.rows.splice(0, 1)
    }

    for (let r = 0; r < json.table.rows.length; r++) {
      const rowObject = {}
      for (let c = 0; c < json.table.cols.length; c++) {
        const cellData = json.table.rows[r]["c"][c]
        const propName = json.table.cols[c].label
        let value = cellData?.v ?? ""
        if (typeof value === "string" && value.startsWith("Date(")) {
          const match = value.match(/Date\((\d+),(\d+),(\d+)\)/)
          if (match) {
            const [_, y, m, d] = match
            value = new Date(Number(y), Number(m), Number(d))
          }
        }
        rowObject[propName] = value
      }
      data.push(rowObject)
    }

    return { status: "success", data }
  } catch (er) {
    console.error("responseToObjects parse error:", er)
    return { status: "error", error: "Nie udało się odczytać dane" }
  }
}

export async function getOrdersData({
  page = 1,
  pageSize = 25,
  search = "",
  status = [],
  objects = [],
  createdBy = [],
  store = [],
  sortField = "createdAt",
  sortDirection = "desc",
  last90Days = false,
} = {}) {
  try {
    const offset = (page - 1) * pageSize
    const colMap = {
      id: "A",
      createdAt: "B",
      createdBy: "C",
      modifiedAt: "D",
      modifiedBy: "E",
      store: "F",
      pricePerUnit: "G",
      totalPrice: "H",
      currency: "I",
      orderName: "J",
      status: "K",
      deadline: "L",
      object: "M",
      link: "N",
      quantity: "O",
      address: "P",
      note: "Q",
      tgid: "R"
    }

    const conditions = []

    if (last90Days) {
      const today = new Date()
      const past30 = new Date(today)
      past30.setDate(today.getDate() - 90)
      const past30Str = past30.toISOString().split("T")[0]
      conditions.push(`B >= date '${past30Str}'`)
    }

    if (status.length) conditions.push(`(${status.map(s => `K='${s}'`).join(" OR ")})`)
    if (objects.length) conditions.push(`(${objects.map(o => `M='${o}'`).join(" OR ")})`)
    if (createdBy.length) conditions.push(`(${createdBy.map(c => `C='${c}'`).join(" OR ")})`)
    if (store.length) conditions.push(`(${store.map(m => `F='${m}'`).join(" OR ")})`)

    if (search) {
      const s = search.toLowerCase().replace(/'/g, "\\'")
      const stringFields = ["J", "C", "N"]
      const searchConditions = stringFields.map(f => `LOWER(${f}) CONTAINS '${s}'`)
      conditions.push(`(${searchConditions.join(" OR ")})`)
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""
    const orderBy = sortField ? `ORDER BY ${colMap[sortField]} ${sortDirection.toUpperCase()}` : ""
    const columns = Object.values(colMap).join(", ")

    // --- если last90Days, убираем LIMIT и OFFSET ---
    const limitClause = last90Days ? "" : `LIMIT ${pageSize} OFFSET ${offset}`
    const queryOrders = `SELECT ${columns} ${where} ${orderBy} ${limitClause}`

    // --- COUNT для статистики ---
    const queryCount  = `SELECT COUNT(A) WHERE A IS NOT NULL ${where ? "AND " + where.replace(/^WHERE /, "") : ""}`

    const [ordersRes, countRes, projectsRes] = await Promise.all([
      fetch(`https://docs.google.com/spreadsheets/d/1El9UR0lhex99HrcftZ1RrAv6iflt6AjFwydfMBhRpIg/gviz/tq?sheet=orders&tq=${encodeURIComponent(queryOrders)}&headers=1`).then(r => r.text()).then(r => responseToObjects(r)),
      fetch(`https://docs.google.com/spreadsheets/d/1El9UR0lhex99HrcftZ1RrAv6iflt6AjFwydfMBhRpIg/gviz/tq?sheet=orders&tq=${encodeURIComponent(queryCount)}&headers=1`).then(r => r.text()).then(r => responseToObjects(r)),
      fetch(`https://docs.google.com/spreadsheets/d/1WEIN-40_8vn2K9bgYnTy3WE9KkVlR2NyhG6MxaBi-us/gviz/tq?sheet=Zakres&tq=${encodeURIComponent("SELECT C WHERE F IS NOT NULL AND DATEDIFF(F, NOW()) > -30")}&headers=1`).then(r => r.text()).then(r => responseToObjects(r)),
    ])

    if (ordersRes.status !== "success") throw new Error("Błąd przy ładowaniu")
    if (countRes.status !== "success") throw new Error("Błąd przy liczenie całkowitej liczby")
    if (projectsRes.status !== "success") throw new Error("Błąd przy ładowaniu obiektów")

    const total = parseInt(countRes.data[0]?.["count id"] || 0, 10)

    return {
      orders: ordersRes.data,
      projects: projectsRes.data,
      total
    }
  } catch (err) {
    console.error(err)
    throw new Error("Coś poszło...")
  }
}





/* 


export async function getOrdersData({
  page = 1,
  pageSize = 25,
  search = "",
  status = [],
  objects = [],
  createdBy = [],
  store = [],
  sortField = "createdAt",
  sortDirection = "desc"
} = {}) {
  try {
    const offset = (page - 1) * pageSize
    const colMap = {
      id: "A",
      createdAt: "B",
      createdBy: "C",
      modifiedAt: "D",
      modifiedBy: "E",
      store: "F",
      pricePerUnit: "G",
      totalPrice: "H",
      currency: "I",
      orderName: "J",
      status: "K",
      deadline: "L",
      object: "M",
      link: "N",
      quantity: "O",
      address: "P",
      note: "Q",
      tgid: "R"
    }

    const conditions = []
    if (status.length) conditions.push(`(${status.map(s => `K='${s}'`).join(" OR ")})`)
    if (objects.length) conditions.push(`(${objects.map(o => `M='${o}'`).join(" OR ")})`)
    if (createdBy.length) conditions.push(`(${createdBy.map(c => `C='${c}'`).join(" OR ")})`)
    if (store.length) conditions.push(`(${store.map(m => `F='${m}'`).join(" OR ")})`)

    if (search) {
      const s = search.toLowerCase().replace(/'/g, "\\'")
      const stringFields = ["J", "C", "N"]
      const searchConditions = stringFields.map(f => `LOWER(${f}) CONTAINS '${s}'`)
      conditions.push(`(${searchConditions.join(" OR ")})`)
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""
    const orderBy = sortField ? `ORDER BY ${colMap[sortField]} ${sortDirection.toUpperCase()}` : ""
    const columns = Object.values(colMap).join(", ")

    const queryOrders = `SELECT ${columns} ${where} ${orderBy} LIMIT ${pageSize} OFFSET ${offset}`
    const queryCount  = `SELECT COUNT(A) WHERE A IS NOT NULL ${where ? "AND " + where.replace(/^WHERE /, "") : ""}`

    const [ordersRes, countRes, projectsRes] = await Promise.all([
      fetch(`https://docs.google.com/spreadsheets/d/1El9UR0lhex99HrcftZ1RrAv6iflt6AjFwydfMBhRpIg/gviz/tq?sheet=orders&tq=${encodeURIComponent(queryOrders)}&headers=1`).then(r => r.text()).then(r => responseToObjects(r)),
      fetch(`https://docs.google.com/spreadsheets/d/1El9UR0lhex99HrcftZ1RrAv6iflt6AjFwydfMBhRpIg/gviz/tq?sheet=orders&tq=${encodeURIComponent(queryCount)}&headers=1`).then(r => r.text()).then(r => responseToObjects(r)),
      fetch(`https://docs.google.com/spreadsheets/d/1WEIN-40_8vn2K9bgYnTy3WE9KkVlR2NyhG6MxaBi-us/gviz/tq?sheet=Zakres&tq=${encodeURIComponent("SELECT C WHERE F IS NOT NULL AND DATEDIFF(F, NOW()) > -30")}&headers=1`).then(r => r.text()).then(r => responseToObjects(r)),
    ])

    if (ordersRes.status !== "success") throw new Error("Błąd przy ładowaniu")
    if (countRes.status !== "success") throw new Error("Błąd przy liczenie całkowitej liczby")
    if (projectsRes.status !== "success") throw new Error("Błąd przy ładowaniu obiektów")

    const total = parseInt(countRes.data[0]?.["count id"] || 0, 10)

    return {
      orders: ordersRes.data,
      projects: projectsRes.data,
      total
    }
  } catch (err) {
    console.error(err)
    throw new Error("Coś poszło...")
  }
}



*/

export async function getOrderById(id) {
  try {
    const colMap = {
      id: "A",
      createdAt: "B",
      createdBy: "C",
      modifiedAt: "D",
      modifiedBy: "E",
      store: "F",
      pricePerUnit: "G",
      totalPrice: "H",
      currency: "I",
      orderName: "J",
      status: "K",
      deadline: "L",
      object: "M",
      link: "N",
      quantity: "O",
      address: "P",
      note: "Q",
      tgid: "R"
    }

    const columns = Object.values(colMap).join(", ")
    const query = `SELECT ${columns} WHERE A='${id}' LIMIT 1`

    const res = await fetch(`https://docs.google.com/spreadsheets/d/1El9UR0lhex99HrcftZ1RrAv6iflt6AjFwydfMBhRpIg/gviz/tq?sheet=orders&tq=${encodeURIComponent(query)}&headers=1`)
      .then(r => r.text())
      .then(r => responseToObjects(r))

    if (res.status !== "success" || !res.data.length) throw new Error("Nie znaleziono zamówienia")

    const order = res.data[0]

    const parseGoogleDate = (d) => {
      if (!d) return null
      if (typeof d === "string" && d.startsWith("Date(")) {
        const parts = d.match(/Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/)
        if (parts) {
          const [, year, month, day, hour, min, sec] = parts.map(Number)
          return new Date(year, month, day, hour, min, sec)
        }
      }
      const dt = new Date(d)
      return isNaN(dt) ? null : dt
    }

    order.createdAt = parseGoogleDate(order.createdAt)
    order.modifiedAt = parseGoogleDate(order.modifiedAt)
    order.deadline = parseGoogleDate(order.deadline)

    return order
  } catch (err) {
    console.error("getOrderById error:", err)
    throw new Error("Błąd przy pobieraniu zamówienia")
  }
}


/* 

export async function getOrderById(id) {
  try {
    const colMap = {
      id: "A", createdAt: "B", createdBy: "C", modifiedAt: "D", modifiedBy: "E",
      magazine: "F", pricePerUnit: "G", orderName: "H", status: "I", deadline: "J",
      object: "K", link: "L", quantity: "M", address: "N", note: "O"
    }
    const columns = Object.values(colMap).join(", ")
    const query = `SELECT ${columns} WHERE A='${id}' LIMIT 1`
    const res = await fetch(`https://docs.google.com/spreadsheets/d/1El9UR0lhex99HrcftZ1RrAv6iflt6AjFwydfMBhRpIg/gviz/tq?sheet=orders&tq=${encodeURIComponent(query)}&headers=1`).then(r => r.text()).then(r => responseToObjects(r))
    if (res.status !== "success" || !res.data.length) throw new Error("Nie znaleziono zamówienia")
    return res.data[0]
  } catch (err) {
    console.error("getOrderById error:", err)
    throw new Error("Błąd przy pobieraniu zamówienia")
  }
}

*/

export async function getUniqueCreatedBy() {
  try {
    const query = `SELECT C WHERE C IS NOT NULL`
    const res = await fetch(`https://docs.google.com/spreadsheets/d/1El9UR0lhex99HrcftZ1RrAv6iflt6AjFwydfMBhRpIg/gviz/tq?sheet=orders&tq=${encodeURIComponent(query)}&headers=1`).then(r => r.text()).then(r => responseToObjects(r))
    if (res.status !== "success") throw new Error("Błąd przy pobieraniu unikalnych twórców")
    const uniqueNames = [...new Set(res.data.map(item => item.createdBy).filter(Boolean))]
    return uniqueNames
  } catch (err) {
    console.error("getUniqueCreatedBy error:", err)
    return []
  }
}



export async function getAllowNotifications(userId) {
  try {
    const query = `SELECT G WHERE A='${userId}' LIMIT 1`
    const res = await fetch(
      `https://docs.google.com/spreadsheets/d/1El9UR0lhex99HrcftZ1RrAv6iflt6AjFwydfMBhRpIg/gviz/tq?sheet=users&tq=${encodeURIComponent(query)}&headers=1`
    ).then(r => r.text()).then(r => responseToObjects(r))

    if (res.status === "success" && res.data.length) {
      const val = res.data[0].allow_notifications
      return val === "1" || val === 1 || val === true || val === "TRUE" || val === "true"
    }

    return false
  } catch (err) {
    console.error("getAllowNotifications error:", err)
    return false
  }
}





export async function getUserPositionBySub(sub) {
  if (!sub) return null

  try {
    const query = `SELECT E WHERE A='${sub}' LIMIT 1`
    const url = `https://docs.google.com/spreadsheets/d/1El9UR0lhex99HrcftZ1RrAv6iflt6AjFwydfMBhRpIg/gviz/tq?sheet=users&tq=${encodeURIComponent(query)}&headers=1`

    const res = await fetch(url).then(r => r.text()).then(r => responseToObjects(r))

    if (res.status === "success" && res.data.length) return res.data[0].position || null

    return null
  } catch (err) {
    console.error("getUserPositionBySub error:", err)
    return null
  }
}




