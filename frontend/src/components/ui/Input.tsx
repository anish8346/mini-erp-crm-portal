import React, { type InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-[#424845] uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-[#727875] pointer-events-none shrink-0">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-white border text-[#1B1C1C] placeholder-[#727875] text-sm rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#4E635A]/20 focus:border-[#4E635A] ${
              leftIcon ? 'pl-10' : 'pl-3.5'
            } pr-3.5 py-2 ${
              error ? 'border-[#BA1A1A] focus:ring-[#BA1A1A]/20 focus:border-[#BA1A1A]' : 'border-[#E2E8E4]'
            } ${className}`}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-[#BA1A1A]">{error}</span>}
        {!error && helperText && <span className="text-xs text-[#727875]">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

