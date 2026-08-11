import React, { type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#4E635A]/30 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-[#4E635A] hover:bg-[#3A4B44] text-white active:bg-[#32403A]',
    secondary:
      'bg-[#F6F3F2] hover:bg-[#EAE7E7] text-[#1B1C1C] border border-[#E2E8E4] active:bg-[#E4E2E1]',
    outline:
      'border border-[#E2E8E4] hover:border-[#C2C8C4] text-[#4E635A] hover:bg-[#F6F3F2]',
    danger:
      'bg-[#BA1A1A] hover:bg-[#93000A] text-white active:bg-[#7A0007]',
    ghost:
      'text-[#424845] hover:bg-[#F0EDED] hover:text-[#1B1C1C]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};

