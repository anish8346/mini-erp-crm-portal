import React from 'react';
import { Package, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const ProductsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Product Catalog</h2>
          <p className="text-xs text-slate-400 mt-1">Master catalog, SKUs, pricing & safety stock thresholds</p>
        </div>
        <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />}>
          Add Product
        </Button>
      </div>

      <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
        <Package className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-200">Product Catalog Foundation Ready</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
          Phase 9 UI Routing & API Client initialized. Full interactive product management view will be assembled in upcoming Phase 12.
        </p>
      </div>
    </div>
  );
};
