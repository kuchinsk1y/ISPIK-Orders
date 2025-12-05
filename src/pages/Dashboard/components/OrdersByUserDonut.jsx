import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { useMemo } from "react"

const COLORS = ["#4d648d","#ff7f50","#00b894","#ffeaa7","#fd79a8","#74b9ff","#a29bfe","#fab1a0","#55efc4","#fdcb6e"]

const OrdersByUserDonut = ({ orders }) => {
  const data = useMemo(() => {
    const map = {}
    orders.forEach(o => {
      const user = o.createdBy || "Nieznany"
      const price = Number(o.totalPricePLN || 0)
      map[user] = (map[user] || 0) + (isNaN(price) ? 0 : price)
    })

    const sorted = Object.entries(map).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value)
    const top = sorted.slice(0, 9)
    const rest = sorted.slice(9)
    if (rest.length) {
      top.push({ name: "Inni", value: rest.reduce((sum, u) => sum + u.value, 0) })
    }

    return top.map((entry, i) => ({ ...entry, color: COLORS[i % COLORS.length] }))
  }, [orders])

  return (
    <div className="flex gap-6 items-center flex-wrap">
      <div className="flex flex-col gap-2 min-w-[120px]">
        {data.map((user, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: user.color }}/>
            <span className="text-sm font-medium">{user.name}</span>
            <span className="text-sm text-gray-600">{user.value.toLocaleString("pl-PL", { minimumFractionDigits: 2 })} PLN</span>
          </div>
        ))}
      </div>
      <div className="flex-1 flex justify-center">
        <div style={{ width: 205, height: 205, minWidth: 205, minHeight: 205 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} label={false}>
                {data.map((entry, index) => (<Cell key={index} fill={entry.color}/>))}
              </Pie>
              <Tooltip formatter={(value) => value.toLocaleString("pl-PL", { minimumFractionDigits: 2 }) + " PLN"}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default OrdersByUserDonut
