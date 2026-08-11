import React from 'react';

export type BadgeVariant =
  | 'admin'
  | 'sales'
  | 'warehouse'
  | 'accounts'
  | 'active'
  | 'inactive'
  | 'lead'
  | 'draft'
  | 'confirmed'
  | 'cancelled'
  | 'in'
  | 'out'
  | 'default';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const styles: Record<BadgeVariant, string> = {
    admin: 'bg-[#EAE7E7] text-[#1B1C1C] border-[#C2C8C4]',
    sales: 'bg-[#D1E8DD] text-[#263932] border-[#8DA399]',
    warehouse: 'bg-[#FFF8E1] text-[#7D562D] border-[#FFDCBD]',
    accounts: 'bg-[#E6F4EA] text-[#2D5A27] border-[#BCF0AE]',
    active: 'bg-[#E6F4EA] text-[#2D5A27] border-[#BCF0AE]',
    inactive: 'bg-[#FCE8E6] text-[#BA1A1A] border-[#FFDAD6]',
    lead: 'bg-[#D1E8DD] text-[#263932] border-[#8DA399]',
    draft: 'bg-[#FFF8E1] text-[#7D562D] border-[#FFDCBD]',
    confirmed: 'bg-[#E6F4EA] text-[#2D5A27] border-[#BCF0AE]',
    cancelled: 'bg-[#FCE8E6] text-[#BA1A1A] border-[#FFDAD6]',
    in: 'bg-[#E6F4EA] text-[#2D5A27] border-[#BCF0AE]',
    out: 'bg-[#FFF8E1] text-[#7D562D] border-[#FFDCBD]',
    default: 'bg-[#F0EDED] text-[#424845] border-[#E2E8E4]',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

