/**
 * Shared button component for major buttons that require a load time and need to be disabled during that.
 * @param {*} children - name to be shown on the button
 * @param {*} onClick - action to be executed when clicked
 * @param {*} type - always a button in this case
 * @param {*} className - button styling
 * @param {*} disabled - disable when loading
 * @returns {JSX.Element} - HTML for button component
 */
export default function Button({ children, onClick, type = "button", className = "", disabled = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 bg-red-600 text-white rounded transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}