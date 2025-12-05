const InputField = ({label, type = "text", registerProps, error, className = "", placeholder = "", disabled = false, value, onChange, ...rest}) => {
  const handleChange = (e) => {
    if (registerProps?.name === "pricePerUnit") {
      let v = e.target.value
      v = v.replace(/[^\d.,-]/g, "")
      v = v.replace(",", ".")
      const match = v.match(/^(-?\d+(\.\d{0,2})?)?/)
      if (match) v = match[0]
      e.target.value = v
    }

    if (registerProps?.onChange) registerProps.onChange(e)
    if (onChange) onChange(e)
  }

  const isControlled = value !== undefined

  return (
    <div className={`flex flex-col ${className}`}>
      <label className="label-text mb-1">{label}</label>
      <input readOnly={disabled} type={type} {...registerProps} {...(isControlled ? { value } : {})} onChange={handleChange} placeholder={placeholder} autoComplete="off"
        className={`input input-bordered w-full duration-300 ${error ? "border-red-500" : ""} ${disabled ? "bg-base-200 opacity-60 cursor-not-allowed" : ""}`}
        {...rest}
      />
      {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
    </div>
  )
}


export default InputField
