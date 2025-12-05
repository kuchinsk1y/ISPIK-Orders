

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { parseDateString } from "../../../utils"

// parseDateString вынесен в utils без изменения логики

function getLast90Days() {
  const dates = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    dates.push(new Date(d));
  }
  return dates;
}

function getISOWeek(date) {
  const temp = new Date(date);
  temp.setHours(0, 0, 0, 0);
  temp.setDate(temp.getDate() + 4 - (temp.getDay() || 7));
  const yearStart = new Date(temp.getFullYear(), 0, 1);
  const week = Math.ceil(((temp - yearStart) / 86400000 + 1) / 7);
  return { week, year: temp.getFullYear() };
}

function formatWeekRange(startDate, endDate) {
  const dd = (n) => String(n).padStart(2, "0");
  return `${dd(startDate.getDate())}.${dd(
    startDate.getMonth() + 1
  )}–${dd(endDate.getDate())}.${dd(endDate.getMonth() + 1)}`;
}

const OrdersChart = ({ orders }) => {
  const data = useMemo(() => {
    const weeks = {};

    orders.forEach((order) => {
      const date = parseDateString(order.createdAt);
      if (!date || isNaN(date.getTime())) return;
      const { week, year } = getISOWeek(date);
      const key = `${year}-W${week}`;
      if (!weeks[key]) weeks[key] = { total: 0, dates: [] };
      const price = Number(order.totalPricePLN || 0);
      weeks[key].total += price;
      weeks[key].dates.push(date);
    });

    const days = getLast90Days();
    const grouped = {};

    days.forEach((d) => {
      const { week, year } = getISOWeek(d);
      const key = `${year}-W${week}`;
      if (!grouped[key])
        grouped[key] = { dates: [], total: weeks[key]?.total || 0 };
      grouped[key].dates.push(d);
    });

    return Object.values(grouped)
      .map((w) => {
        const sorted = w.dates.sort((a, b) => a - b);
        const start = sorted[0];
        const end = sorted[sorted.length - 1];
        return {
          id: `${start.getTime()}-${end.getTime()}`,
          total: w.total,
          tooltipLabel: formatWeekRange(start, end),
        };
      })
      .sort((a, b) => a.id.localeCompare(b.id));
  }, [orders]);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4d648d" stopOpacity={0.4} />
            <stop offset="75%" stopColor="#4d648d" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid
  strokeDasharray="2 2"
  stroke="rgba(255,255,255,0.06)"   // едва заметная линия
/>


        <XAxis dataKey="id" hide />

        <YAxis
          tick={{ fill: "#555", fontSize: 12 }}
          tickFormatter={(v) =>
            v.toLocaleString("pl-PL", { minimumFractionDigits: 0 })
          }
        />

       <Tooltip
  content={({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: 8,
          border: "1px solid #ddd",
          padding: "12px",
          minWidth: 180,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 4,
            fontWeight: 600,
          }}
        >
          <span>Tydzień:</span>
          <span>{data.tooltipLabel}</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>Suma:</span>
          <span>
            {Number(data.total).toLocaleString("pl-PL", {
              minimumFractionDigits: 2,
            })}{" "}
            PLN
          </span>
        </div>
      </div>
    );
  }}
/>



<Line
  type="monotone"
  dataKey="total"
  name="" // убираем "total" в tooltip
  stroke="#4d648d"
  strokeWidth={2.5}
  dot={{ r: 4, fill: "#4d648d", stroke: "#fff", strokeWidth: 1 }}
  activeDot={{ r: 6, fill: "#4d648d", stroke: "#fff", strokeWidth: 2 }}
  fill="url(#colorTotal)"
/>

      </LineChart>
    </ResponsiveContainer>
  );
};

export default OrdersChart;
