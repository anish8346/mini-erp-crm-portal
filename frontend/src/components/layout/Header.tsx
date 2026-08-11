import React from 'react';
import { Menu, LogOut, Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';

export interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, title = 'Portal' }) => {
  const { user, logout } = useAuth();

  const roleVariant = user?.role ? (user.role.toLowerCase() as any) : 'default';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#E2E8E4] px-4 sm:px-6 flex items-center justify-between shadow-2xs">
      {/* Left Title & Mobile Menu Trigger */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-[#727875] hover:text-[#1B1C1C] p-2 rounded hover:bg-[#F6F3F2] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base sm:text-lg font-semibold text-[#1B1C1C] tracking-tight">{title}</h1>
      </div>

      {/* Center Search Input (Stitch Header Pattern) */}
      <div className="hidden md:flex items-center relative max-w-xs w-full">
        <Search className="w-4 h-4 text-[#727875] absolute left-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Global Search (Ctrl + K)..."
          className="w-full bg-[#F6F3F2] border border-[#E2E8E4] rounded pl-9 pr-12 py-1.5 text-xs text-[#1B1C1C] placeholder-[#727875] focus:outline-none focus:ring-1 focus:ring-[#4E635A] focus:bg-white transition-all"
        />
        <kbd className="absolute right-2.5 px-1.5 py-0.5 text-[10px] font-medium text-[#727875] bg-[#EAE7E7] rounded border border-[#C2C8C4]">
          Ctrl K
        </kbd>
      </div>

      {/* Right User Bar */}
      <div className="flex items-center space-x-4">
        {/* Notifications Icon */}
        <button className="relative p-2 text-[#727875] hover:text-[#1B1C1C] hover:bg-[#F6F3F2] rounded transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#4E635A] rounded-full ring-2 ring-white" />
        </button>

        {/* User Info Pill */}
        {user && (
          <div className="flex items-center space-x-3 pl-3 border-l border-[#E2E8E4]">
            <div className="w-8 h-8 rounded-full bg-[#D1E8DD] border border-[#8DA399] flex items-center justify-center text-[#263932] font-semibold text-xs shadow-2xs">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#1B1C1C] leading-tight">{user.name}</span>
              <div className="mt-0.5">
                <Badge variant={roleVariant}>{user.role}</Badge>
              </div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={logout}
          title="Sign out of portal"
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-[#424845] hover:text-[#BA1A1A] hover:bg-[#FCE8E6] rounded border border-transparent hover:border-[#FFDAD6] transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

