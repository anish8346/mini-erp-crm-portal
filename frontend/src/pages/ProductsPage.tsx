import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { productService, type ProductListResponse } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Product } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Table, type Column } from '../components/ui/Table';
import { Pagination } from '../components/ui/Pagination';
import { ErrorState } from '../components/ui/ErrorState';
import { Modal } from '../components/ui/Modal';
import { ProductModal } from '../components/products/ProductModal';

export const ProductsPage: React.FC = () => {
  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();

  const [data, setData] = useState<ProductListResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [lowStockFilter, setLowStockFilter] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);

  // Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const canManage = hasRole('ADMIN', 'WAREHOUSE');

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await productService.getProducts({
        search: search.trim() || undefined,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        lowStock: lowStockFilter ? true : undefined,
        page,
        limit,
      });
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  }, [search, categoryFilter, lowStockFilter, page, limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setIsProductModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await productService.deleteProduct(deleteTarget.id);
      showSuccess(`Product '${deleteTarget.productName}' deleted successfully`);
      setDeleteTarget(null);
      fetchProducts();
    } catch (err: any) {
      showError(err.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<Product>[] = [
    {
      header: 'Product Name',
      accessor: (row) => <span className="font-bold text-slate-100">{row.productName}</span>,
    },
    {
      header: 'SKU',
      accessor: (row) => <span className="font-mono text-xs text-indigo-400 font-semibold">{row.sku}</span>,
    },
    {
      header: 'Category',
      accessor: (row) => <span className="text-xs text-slate-300">{row.category}</span>,
    },
    {
      header: 'Unit Price',
      accessor: (row) => (
        <span className="font-semibold text-slate-200">
          ₹{row.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: 'Current Stock',
      accessor: (row) => (
        <span
          className={`font-bold font-mono ${
            row.currentStock <= row.minimumStock ? 'text-rose-400' : 'text-slate-100'
          }`}
        >
          {row.currentStock}
        </span>
      ),
    },
    {
      header: 'Min Threshold',
      accessor: (row) => <span className="text-xs font-mono text-slate-400">{row.minimumStock}</span>,
    },
    {
      header: 'Warehouse',
      accessor: (row) => <span className="text-xs text-slate-400">{row.warehouse || 'Main Storage'}</span>,
    },
    {
      header: 'Stock Status',
      accessor: (row) =>
        row.currentStock <= row.minimumStock ? (
          <Badge variant="inactive">
            <AlertTriangle className="w-3 h-3 mr-1 inline" />
            Low Stock
          </Badge>
        ) : (
          <Badge variant="active">In Stock</Badge>
        ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (row) => (
        <div className="flex items-center justify-end space-x-1">
          {canManage && (
            <>
              <Button
                variant="ghost"
                size="sm"
                title="Edit Product"
                onClick={() => handleOpenEditModal(row)}
              >
                <Edit2 className="w-4 h-4 text-amber-400" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                title="Delete Product"
                onClick={() => setDeleteTarget(row)}
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Package className="w-6 h-6 text-emerald-400" />
            <span>Product Master Catalog</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Wholesale inventory items, SKUs, pricing & safety stock limits
          </p>
        </div>

        {canManage && (
          <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />} onClick={handleOpenAddModal}>
            Add New Product
          </Button>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 bg-slate-900/60 p-4 border border-slate-800 rounded-2xl shadow-lg items-center">
        <div className="sm:col-span-2">
          <Input
            placeholder="Search product name, SKU, or category..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="w-4 h-4 text-slate-500" />}
          />
        </div>

        <Select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          options={[
            { label: 'All Categories', value: 'ALL' },
            { label: 'Motors & Drives', value: 'Motors & Drives' },
            { label: 'Control Panels', value: 'Control Panels' },
            { label: 'Sensors & Relays', value: 'Sensors & Relays' },
            { label: 'Cables & Wiring', value: 'Cables & Wiring' },
          ]}
        />

        <div className="flex items-center space-x-2 pl-2">
          <input
            type="checkbox"
            id="lowStockToggle"
            checked={lowStockFilter}
            onChange={(e) => {
              setLowStockFilter(e.target.checked);
              setPage(1);
            }}
            className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
          />
          <label htmlFor="lowStockToggle" className="text-xs font-semibold text-rose-300 cursor-pointer select-none">
            Show Low Stock Only
          </label>
        </div>
      </div>

      {/* Data Table */}
      {error ? (
        <ErrorState title="Failed to Load Products" message={error} onRetry={fetchProducts} />
      ) : (
        <div className="space-y-4">
          <Table
            columns={columns}
            data={data?.products || []}
            keyExtractor={(row) => row.id}
            isLoading={isLoading}
            emptyMessage="No catalog products match search criteria."
          />

          {data?.pagination && (
            <Pagination pagination={data.pagination} onPageChange={(p) => setPage(p)} />
          )}
        </div>
      )}

      {/* Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={editingProduct}
        onSuccess={fetchProducts}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Product Deletion"
        subtitle="Deletes product catalog record if not referenced in sales challans."
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm} isLoading={isDeleting}>
              Delete Product
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-300">
          Are you sure you want to delete product{' '}
          <strong className="text-slate-100 font-bold">{deleteTarget?.productName}</strong> ({deleteTarget?.sku})?
        </p>
      </Modal>
    </div>
  );
};
