import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  FileText,
  UserCheck,
  Building2,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Customer CRM', path: '/customers', icon: Users },
    { label: 'Product Catalog', path: '/products', icon: Package },
    { label: 'Inventory Movements', path: '/inventory', icon: Boxes },
    { label: 'Sales Challans', path: '/challans', icon: FileText },
    { label: 'User Accounts', path: '/users', icon: UserCheck, roles: ['ADMIN'] },
  ];

  const roleVariant = user?.role ? (user.role.toLowerCase() as any) : 'default';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-600 rounded-lg shadow-md shadow-indigo-600/30">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-100 text-sm leading-tight">Fundsroom ERP</span>
                <span className="text-[10px] text-slate-400">Operations Portal</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navItems.map((item) => {
              if (item.roles && user && !item.roles.includes(user.role)) {
                return null;
              }

              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Role Card */}
        {user && (
          <div className="p-4 border-t border-slate-800 m-3 bg-slate-950/60 rounded-xl border">
            <div className="flex items-center justify-between">
              <div className="flex flex-col truncate pr-2">
                <span className="text-xs font-semibold text-slate-200 truncate">{user.name}</span>
                <span className="text-[10px] text-slate-400 truncate">{user.email}</span>
              </div>
              <Badge variant={roleVariant}>{user.role}</Badge>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
