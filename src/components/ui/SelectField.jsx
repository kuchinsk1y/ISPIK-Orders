const SelectField = ({ label, registerProps, options = [], placeholder = "", error, className = "", disabled = false }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="label-text mb-1">{label}</label>
      <select {...registerProps} disabled={false} className={`select select-bordered w-full duration-300 ${error ? "border-red-500" : ""} ${disabled ? "bg-base-200 opacity-60 cursor-not-allowed pointer-events-none" : ""}`}>
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
      </select>
      {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
    </div>
  )
}

export default SelectField
