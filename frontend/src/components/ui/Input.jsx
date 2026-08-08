export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block font-body text-sm text-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-xl glass px-4 py-2.5 text-text-primary font-body placeholder:text-text-tertiary
          focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(255,59,107,0.15)]
          transition-shadow ${className}`}
        {...props}
      />
      {error && <p className="text-danger text-xs mt-1.5">{error}</p>}
    </div>
  );
}