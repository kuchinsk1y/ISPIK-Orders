const TextAreaField = ({ label, registerProps, rows = 3, placeholder = "", error, className = "", disabled = false }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="label-text mb-1">{label}</label>
      <textarea {...registerProps} rows={rows} placeholder={placeholder} autoComplete="off" readOnly={disabled} className={`textarea textarea-bordered w-full duration-300 ${error ? "border-red-500" : ""} ${disabled ? "bg-base-200 opacity-60 cursor-not-allowed" : ""}`}/>
      {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
    </div>
  )
}

export default TextAreaField
