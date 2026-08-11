import React from 'react';
import { Users, Package, Boxes, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/Badge';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-900 border border-indigo-500/20 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Welcome back, {user?.name}! 👋</h2>
          <p className="text-xs text-slate-400 mt-1">
            Mini ERP + CRM Operations Portal Dashboard
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Role:</span>
          <Badge variant={user?.role ? (user.role.toLowerCase() as any) : 'default'}>
            {user?.role}
          </Badge>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Customers</span>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100 mt-3">5</div>
          <span className="text-[10px] text-emerald-400 font-medium">Active CRM Leads & Clients</span>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Products Catalog</span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100 mt-3">4</div>
          <span className="text-[10px] text-slate-400 font-medium">Catalog items across bays</span>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Stock Movements</span>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100 mt-3">5</div>
          <span className="text-[10px] text-amber-400 font-medium">IN / OUT transactions</span>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Sales Challans</span>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100 mt-3">2</div>
          <span className="text-[10px] text-purple-400 font-medium">Draft & Confirmed Challans</span>
        </div>
      </div>
    </div>
  );
};
