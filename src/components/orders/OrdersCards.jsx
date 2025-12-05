const OrdersCards = ({ title, value, icon, children }) => {
  return (
    <div className="p-4 bg-base-200 rounded-lg shadow-md flex flex-col gap-2 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-base-content/70">{title}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
        {icon && <div className="text-primary text-2xl">{icon}</div>}
      </div>
      {children && <div className="mt-2 text-sm text-base-content/70">{children}</div>}
    </div>
  )
}

export default OrdersCards
