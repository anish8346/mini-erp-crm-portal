import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const location = useLocation();

  const getPageTitle = (pathname: string): string => {
    if (pathname.startsWith('/dashboard')) return 'Executive Dashboard';
    if (pathname.startsWith('/customers')) return 'Customer CRM Operations';
    if (pathname.startsWith('/products')) return 'Product Master Catalog';
    if (pathname.startsWith('/inventory')) return 'Inventory & Stock Ledger';
    if (pathname.startsWith('/challans')) return 'Sales Delivery Challans';
    if (pathname.startsWith('/users')) return 'User Access Management';
    return 'Operations Portal';
  };

  return (
    <div className="min-h-screen bg-[#FCF9F8] text-[#1B1C1C] flex flex-col font-sans antialiased">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-[230px] flex flex-col flex-1 min-h-screen">
        {/* Top Header */}
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title={getPageTitle(location.pathname)}
        />

        {/* Dynamic Route Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

