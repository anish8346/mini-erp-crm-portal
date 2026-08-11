import { type SelectHTMLAttributes, forwardRef } from 'react';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="text-xs font-medium text-[#424845] uppercase tracking-wider">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`w-full bg-white border text-[#1B1C1C] text-sm rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#4E635A]/20 focus:border-[#4E635A] px-3.5 py-2 ${
            error ? 'border-[#BA1A1A] focus:ring-[#BA1A1A]/20' : 'border-[#E2E8E4]'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white text-[#1B1C1C]">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-[#BA1A1A]">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';

