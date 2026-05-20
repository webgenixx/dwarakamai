/**
 * PhoneInput — always prefixes +91, stores the full number in state.
 * Props:
 *   value        — full phone string (e.g. "+919876543210")
 *   onChange     — called with the full value including +91
 *   name         — input name attribute
 *   required     — boolean
 *   placeholder  — digits placeholder (default "98765 43210")
 *   className    — extra classes for the input element
 *   inputClass   — alias for className
 *   disabled     — boolean
 */
const PhoneInput = ({
  value = '',
  onChange,
  name = 'phone',
  required = false,
  placeholder = '98765 43210',
  className = '',
  inputClass = '',
  disabled = false,
}) => {
  const PREFIX = '+91';

  // Strip the prefix to get just the local digits for display
  const localValue = value.startsWith(PREFIX)
    ? value.slice(PREFIX.length)
    : value;

  const handleChange = (e) => {
    // Only allow digits and spaces
    const digits = e.target.value.replace(/[^\d\s]/g, '');
    onChange({ target: { name, value: PREFIX + digits } });
  };

  const combinedClass = className || inputClass;

  return (
    <div className="flex">
      {/* Country code badge */}
      <span className="inline-flex items-center px-4 bg-gray-100 border border-r-0 border-gray-200 rounded-l-2xl text-sm font-body font-bold text-gray-600 select-none whitespace-nowrap">
        🇮🇳 +91
      </span>
      <input
        type="tel"
        name={name}
        required={required}
        disabled={disabled}
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`flex-1 min-w-0 rounded-r-2xl border border-gray-200 px-4 py-3 text-sm font-body text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all ${combinedClass}`}
      />
    </div>
  );
};

export default PhoneInput;
