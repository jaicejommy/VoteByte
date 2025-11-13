import { useState } from "react";

const DateInput = ({ value, onChange, label, required = false }) => {
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const input = e.target.value;
    
    // Allow only numbers and hyphens
    const sanitized = input.replace(/[^\d-]/g, "");
    
    // Validate YYYY-MM-DD format
    const regex = /^\d{0,4}-?\d{0,2}-?\d{0,2}$/;
    
    if (!regex.test(sanitized)) {
      setError("Invalid format. Use YYYY-MM-DD");
      return;
    }

    // Check if complete date is valid (YYYY-MM-DD)
    if (sanitized.length === 10) {
      const [year, month, day] = sanitized.split("-");
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);
      const dayNum = parseInt(day);

      // Validate date ranges
      if (monthNum < 1 || monthNum > 12) {
        setError("Month must be between 01 and 12");
        return;
      }

      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      if (yearNum % 4 === 0 && (yearNum % 100 !== 0 || yearNum % 400 === 0)) {
        daysInMonth[1] = 29;
      }

      if (dayNum < 1 || dayNum > daysInMonth[monthNum - 1]) {
        setError(`Day must be between 01 and ${daysInMonth[monthNum - 1]}`);
        return;
      }

      setError("");
    } else if (sanitized.length > 0 && sanitized.length < 10) {
      setError(""); // Clear error while still typing
    }

    onChange(sanitized);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="text-sm text-gray-400 block mb-2">
          {label} <span className="text-gray-500">(YYYY-MM-DD)</span>
        </label>
      )}
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="YYYY-MM-DD"
        maxLength="10"
        className={`w-full bg-gray-800/40 border p-3 rounded-lg outline-none transition-colors ${
          error
            ? "border-red-500 focus:border-red-400"
            : "border-green-400/20 focus:border-green-400"
        }`}
        required={required}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default DateInput;
