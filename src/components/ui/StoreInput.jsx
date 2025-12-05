const StoreInput = ({ register, options, error, disabled }) => {
  return (
    <div className="flex flex-col w-56 relative">
      <label className="label-text mb-1">Sklep</label>
      <input type="text" list="store-list" {...register("store")} placeholder="Wybierz lub wpisz..." autoComplete="off" readOnly={disabled} className={`input input-bordered w-full duration-300 ${error ? "border-red-500" : ""} ${disabled ? "bg-base-200 opacity-60 cursor-not-allowed" : ""}`}/>
      <datalist id="store-list">
        {options.map((m) => (
          <option key={m} value={m} />
        ))}
      </datalist>
      {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
    </div>
  )
}

export default StoreInput
