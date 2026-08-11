import React from 'react';
import { Boxes, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const InventoryPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Inventory & Stock Movements</h2>
          <p className="text-xs text-slate-400 mt-1">Audit log of inward (IN) additions & outward (OUT) dispatches</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" size="md" icon={<ArrowUpRight className="w-4 h-4 text-emerald-400" />}>
            Stock IN
          </Button>
          <Button variant="outline" size="md" icon={<ArrowDownLeft className="w-4 h-4 text-amber-400" />}>
            Stock OUT
          </Button>
        </div>
      </div>

      <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
        <Boxes className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-200">Inventory Ledger Foundation Ready</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
          Phase 9 UI Routing & API Services initialized. Full stock movement tables & low stock alert dialogs will be assembled in Phase 12.
        </p>
      </div>
    </div>
  );
};
