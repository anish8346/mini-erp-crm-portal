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
          className="fixed inset-0 z-40 bg-[#1B1C1C]/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-[230px] bg-[#FCF9F8] border-r border-[#E2E8E4] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="flex items-center justify-between h-16 px-5 border-b border-[#E2E8E4]">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#4E635A] rounded text-white shadow-xs">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-[#1B1C1C] text-sm leading-tight">Fundsroom ERP</span>
                <span className="text-[10px] text-[#727875]">Operations Portal</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-[#727875] hover:text-[#1B1C1C] p-1 rounded hover:bg-[#F6F3F2]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
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
                    `flex items-center space-x-3 px-3 py-2.5 rounded text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-[#D1E8DD] text-[#1B1C1C] font-semibold border-l-[3px] border-l-[#4E635A]'
                        : 'text-[#424845] hover:text-[#1B1C1C] hover:bg-[#F6F3F2]'
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
          <div className="p-3 border border-[#E2E8E4] m-3 bg-white rounded shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex flex-col truncate pr-2">
                <span className="text-xs font-semibold text-[#1B1C1C] truncate">{user.name}</span>
                <span className="text-[10px] text-[#727875] truncate">{user.email}</span>
              </div>
              <Badge variant={roleVariant}>{user.role}</Badge>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

