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
    admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    sales: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    warehouse: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    accounts: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    inactive: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    lead: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    draft: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    in: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    out: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    default: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
