import React from 'react';
import { FileText, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const ChallansPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Sales Delivery Challans</h2>
          <p className="text-xs text-slate-400 mt-1">Delivery challans, item snapshots, confirmation & cancellation</p>
        </div>
        <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />}>
          Create Challan
        </Button>
      </div>

      <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
        <FileText className="w-12 h-12 text-purple-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-200">Delivery Challans Foundation Ready</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
          Phase 9 UI Routing & API Client initialized. Interactive multi-item challan builder & confirmation modal will be assembled in Phase 13.
        </p>
      </div>
    </div>
  );
};
