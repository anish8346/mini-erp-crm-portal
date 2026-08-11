import React, { useState, useEffect, useCallback } from 'react';
import {
  Boxes,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  RefreshCw,
  Search,
  History,
} from 'lucide-react';
import { inventoryService, type StockMovementListResponse } from '../services/inventoryService';
import { productService, type ProductListResponse } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import type { Product, StockMovement } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Table, type Column } from '../components/ui/Table';
import { Pagination } from '../components/ui/Pagination';
import { ErrorState } from '../components/ui/ErrorState';
import { StockMovementModal } from '../components/inventory/StockMovementModal';

export const InventoryPage: React.FC = () => {
  const { hasRole } = useAuth();

  // Products Ledger state
  const [productData, setProductData] = useState<ProductListResponse | null>(null);
  const [isProductsLoading, setIsProductsLoading] = useState<boolean>(true);
  const [productSearch, setProductSearch] = useState<string>('');

  // Stock Movement History state
  const [movementData, setMovementData] = useState<StockMovementListResponse | null>(null);
  const [isMovementsLoading, setIsMovementsLoading] = useState<boolean>(true);
  const [movementTypeFilter, setMovementTypeFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [movementPage, setMovementPage] = useState<number>(1);

  // Low stock products alert state
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);

  // Errors
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [movementModalOpen, setMovementModalOpen] = useState<boolean>(false);
  const [movementType, setMovementType] = useState<'IN' | 'OUT'>('IN');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const canManageStock = hasRole('ADMIN', 'WAREHOUSE');

  const fetchProductsLedger = useCallback(async () => {
    setIsProductsLoading(true);
    try {
      const res = await productService.getProducts({
        search: productSearch.trim() || undefined,
        limit: 50,
      });
      setProductData(res);
    } catch (err: any) {
      console.error('Failed to load products ledger:', err);
    } finally {
      setIsProductsLoading(false);
    }
  }, [productSearch]);

  const fetchLowStockAlerts = useCallback(async () => {
    try {
      const res = await inventoryService.getLowStockProducts();
      setLowStockProducts(res.products);
    } catch (err: any) {
      console.error('Failed to load low stock alerts:', err);
    }
  }, []);

  const fetchMovements = useCallback(async () => {
    setIsMovementsLoading(true);
    try {
      const res = await inventoryService.getMovements({
        type: movementTypeFilter !== 'ALL' ? movementTypeFilter : undefined,
        page: movementPage,
        limit: 10,
      });
      setMovementData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch inventory movements history');
    } finally {
      setIsMovementsLoading(false);
    }
  }, [movementTypeFilter, movementPage]);

  const refreshAll = useCallback(() => {
    fetchProductsLedger();
    fetchLowStockAlerts();
    fetchMovements();
  }, [fetchProductsLedger, fetchLowStockAlerts, fetchMovements]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const handleOpenMovementModal = (type: 'IN' | 'OUT', targetProd?: Product) => {
    setMovementType(type);
    setSelectedProduct(targetProd || null);
    setMovementModalOpen(true);
  };

  // Stock Ledger Table Columns
  const ledgerColumns: Column<Product>[] = [
    {
      header: 'Product',
      accessor: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-100">{row.productName}</span>
          <span className="text-[10px] text-slate-500 font-mono">{row.category}</span>
        </div>
      ),
    },
    {
      header: 'SKU',
      accessor: (row) => <span className="font-mono text-xs text-indigo-400 font-semibold">{row.sku}</span>,
    },
    {
      header: 'Current Stock',
      accessor: (row) => (
        <span
          className={`font-bold font-mono text-sm ${
            row.currentStock <= row.minimumStock ? 'text-rose-400' : 'text-slate-100'
          }`}
        >
          {row.currentStock} units
        </span>
      ),
    },
    {
      header: 'Min Threshold',
      accessor: (row) => <span className="text-xs font-mono text-slate-400">{row.minimumStock}</span>,
    },
    {
      header: 'Warehouse',
      accessor: (row) => <span className="text-xs text-slate-400">{row.warehouse || 'Main Bay'}</span>,
    },
    {
      header: 'Stock Status',
      accessor: (row) =>
        row.currentStock <= row.minimumStock ? (
          <Badge variant="inactive">Low Stock Alert</Badge>
        ) : (
          <Badge variant="active">Optimal</Badge>
        ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (row) => (
        <div className="flex items-center justify-end space-x-2">
          {canManageStock && (
            <>
              <Button
                variant="outline"
                size="sm"
                icon={<ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />}
                onClick={() => handleOpenMovementModal('IN', row)}
              >
                Stock IN
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<ArrowDownLeft className="w-3.5 h-3.5 text-amber-400" />}
                onClick={() => handleOpenMovementModal('OUT', row)}
              >
                Stock OUT
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  // Movements Audit History Columns
  const movementColumns: Column<StockMovement>[] = [
    {
      header: 'Product',
      accessor: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-200">{row.product?.productName || 'N/A'}</span>
          <span className="text-[10px] text-slate-500 font-mono">{row.product?.sku}</span>
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: (row) => (
        <Badge variant={row.type.toLowerCase() as any}>{row.type}</Badge>
      ),
    },
    {
      header: 'Quantity',
      accessor: (row) => (
        <span
          className={`font-bold font-mono ${
            row.type === 'IN' ? 'text-emerald-400' : 'text-amber-400'
          }`}
        >
          {row.type === 'IN' ? '+' : '-'}{row.quantity}
        </span>
      ),
    },
    {
      header: 'Reason / Ref',
      accessor: (row) => <span className="text-xs text-slate-300">{row.reason || 'N/A'}</span>,
    },
    {
      header: 'Performed By',
      accessor: (row) => (
        <div className="flex flex-col text-xs">
          <span className="font-medium text-slate-200">{row.creator?.name || 'System'}</span>
          <span className="text-[10px] text-slate-500">{row.creator?.email}</span>
        </div>
      ),
    },
    {
      header: 'Timestamp',
      accessor: (row) => (
        <span className="text-xs text-slate-400 font-mono">
          {new Date(row.createdAt).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Boxes className="w-6 h-6 text-amber-400" />
            <span>Inventory & Stock Ledger</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time stock ledger, inward (IN) arrivals, outward (OUT) dispatches & audit history
          </p>
        </div>

        {canManageStock && (
          <div className="flex items-center space-x-3">
            <Button
              variant="primary"
              size="md"
              icon={<ArrowUpRight className="w-4 h-4" />}
              onClick={() => handleOpenMovementModal('IN')}
            >
              Add Stock (IN)
            </Button>
            <Button
              variant="secondary"
              size="md"
              icon={<ArrowDownLeft className="w-4 h-4 text-amber-400" />}
              onClick={() => handleOpenMovementModal('OUT')}
            >
              Issue Stock (OUT)
            </Button>
          </div>
        )}
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockProducts.length > 0 && (
        <div className="p-4 bg-rose-950/30 border border-rose-800/50 rounded-2xl flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3 text-rose-300">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold text-sm">
                Low Stock Alert: {lowStockProducts.length} Product(s) Below Minimum Threshold!
              </span>
              <p className="text-xs text-rose-300/80">
                {lowStockProducts.map((p) => `${p.productName} (${p.currentStock}/${p.minimumStock})`).join(', ')}
              </p>
            </div>
          </div>
          {canManageStock && (
            <Button
              variant="danger"
              size="sm"
              icon={<ArrowUpRight className="w-3.5 h-3.5" />}
              onClick={() => handleOpenMovementModal('IN', lowStockProducts[0])}
            >
              Restock Item
            </Button>
          )}
        </div>
      )}

      {/* Section 1: Current Stock Ledger */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <span>Live Stock Balances</span>
          </h3>
          <div className="max-w-xs w-full">
            <Input
              placeholder="Search product or SKU..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-500" />}
            />
          </div>
        </div>

        <Table
          columns={ledgerColumns}
          data={productData?.products || []}
          keyExtractor={(row) => row.id}
          isLoading={isProductsLoading}
          emptyMessage="No stock items found."
        />
      </div>

      {/* Section 2: Stock Movement Audit History */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100">Stock Movements Audit Log</h3>
          </div>

          <div className="flex items-center space-x-3">
            <Select
              value={movementTypeFilter}
              onChange={(e) => {
                setMovementTypeFilter(e.target.value as any);
                setMovementPage(1);
              }}
              options={[
                { label: 'All Movement Types', value: 'ALL' },
                { label: 'Stock IN Only', value: 'IN' },
                { label: 'Stock OUT Only', value: 'OUT' },
              ]}
            />
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={fetchMovements}
            >
              Refresh Log
            </Button>
          </div>
        </div>

        {error ? (
          <ErrorState title="Failed to Load Movements" message={error} onRetry={fetchMovements} />
        ) : (
          <div className="space-y-4">
            <Table
              columns={movementColumns}
              data={movementData?.movements || []}
              keyExtractor={(row) => row.id}
              isLoading={isMovementsLoading}
              emptyMessage="No movement logs recorded yet."
            />

            {movementData?.pagination && (
              <Pagination
                pagination={movementData.pagination}
                onPageChange={(p) => setMovementPage(p)}
              />
            )}
          </div>
        )}
      </div>

      {/* Stock Movement Modal */}
      <StockMovementModal
        isOpen={movementModalOpen}
        onClose={() => setMovementModalOpen(false)}
        type={movementType}
        product={selectedProduct}
        allProducts={productData?.products || []}
        onSuccess={refreshAll}
      />
    </div>
  );
};
