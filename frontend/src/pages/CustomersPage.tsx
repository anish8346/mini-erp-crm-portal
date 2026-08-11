import React from 'react';
import { Users, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const CustomersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Customer CRM</h2>
          <p className="text-xs text-slate-400 mt-1">Manage wholesale accounts, leads & sales follow-ups</p>
        </div>
        <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />}>
          Add Customer
        </Button>
      </div>

      <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
        <Users className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-200">Customer CRM Foundation Ready</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
          Phase 9 UI Routing & API Integration foundation initialized. Full interactive CRM view will be assembled in upcoming Phase 11.
        </p>
      </div>
    </div>
  );
};
