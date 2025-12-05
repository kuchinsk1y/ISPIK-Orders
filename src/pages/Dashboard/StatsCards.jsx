import { useEffect, useState } from "react"

const StatsCards = ({ stats, loading }) => {
  const [animatedValues, setAnimatedValues] = useState(stats.map(() => 0))
  const [visible, setVisible] = useState(stats.map(() => false))

  useEffect(() => {
    if (!loading) {
      const duration = 800
      const start = performance.now()
      const targetValues = stats.map((s) => s.value)

      const step = (timestamp) => {
        const progress = Math.min((timestamp - start) / duration, 1)
        setAnimatedValues((prevValues) => targetValues.map((v, i) => Math.floor(prevValues[i] + (v - prevValues[i]) * progress)))
        if (progress < 1) requestAnimationFrame(step)
      }

      requestAnimationFrame(step)
    } else {
      const interval = setInterval(() => {
        setAnimatedValues(stats.map(() => Math.floor(Math.random() * 100)))
      }, 100)
      return () => clearInterval(interval)
    }
  }, [stats, loading])

  useEffect(() => {
    const timers = stats.map((_, idx) =>
      setTimeout(() => {
        setVisible((v) => {
          const copy = [...v]
          copy[idx] = true
          return copy
        })
      }, idx * 150)
    )
    return () => timers.forEach(clearTimeout)
  }, [stats])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => (
        <div key={idx} className={`card shadow-lg rounded-2xl p-6 transform transition-all duration-500 ${visible[idx] ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"} hover:scale-105 hover:shadow-xl bg-base-200 dark:bg-base-900 border border-gray-300 dark:border-gray-600`}>
          <div className="flex items-center gap-4">
            <div className="text-4xl text-primary animate-pulse">{stat.icon}</div>
            <div>
              <h3 className="text-2xl font-bold text-base-content">{animatedValues[idx]}</h3>
              <p className="text-sm opacity-70">{stat.title}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsCards
