export default function InputField({ name, type = "text", value, onChange, placeholder, disabled, label, error, className = "" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-black ${className}`}
        required
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
