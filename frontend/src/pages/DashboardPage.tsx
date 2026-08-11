import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Package,
  Boxes,
  FileText,
  AlertTriangle,
  Clock,
  RefreshCw,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dashboardService, type DashboardMetrics } from '../services/dashboardService';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { Table, type Column } from '../components/ui/Table';
import type { Challan, Product, StockMovement } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getMetrics();
      setMetrics(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError(err.message || 'Failed to load live dashboard statistics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading && !metrics) {
    return <LoadingSpinner label="Loading live operational metrics..." />;
  }

  if (error && !metrics) {
    return <ErrorState title="Dashboard API Error" message={error} onRetry={fetchDashboardData} />;
  }

  const kpis = metrics?.kpis || {
    totalCustomers: 0,
    totalProducts: 0,
    lowStockCount: 0,
    totalChallans: 0,
    todaysChallans: 0,
  };

  // Recent Challans Table Columns
  const challanColumns: Column<Challan>[] = [
    {
      header: 'Challan #',
      accessor: (row) => (
        <span className="font-bold text-indigo-400 font-mono text-xs">{row.challanNumber}</span>
      ),
    },
    {
      header: 'Customer',
      accessor: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-200">{row.customer?.customerName || 'N/A'}</span>
          {row.customer?.businessName && (
            <span className="text-[10px] text-slate-500">{row.customer.businessName}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge variant={row.status.toLowerCase() as any}>{row.status}</Badge>
      ),
    },
    {
      header: 'Total Quantity',
      accessor: (row) => <span className="font-semibold text-slate-200">{row.totalQuantity} units</span>,
    },
    {
      header: 'Created Date',
      accessor: (row) => (
        <span className="text-slate-400 text-xs">{new Date(row.createdAt).toLocaleDateString()}</span>
      ),
    },
  ];

  // Low Stock Table Columns
  const lowStockColumns: Column<Product>[] = [
    {
      header: 'Product Name',
      accessor: (row) => <span className="font-semibold text-slate-200">{row.productName}</span>,
    },
    {
      header: 'SKU',
      accessor: (row) => <span className="font-mono text-xs text-slate-400">{row.sku}</span>,
    },
    {
      header: 'Current / Min Stock',
      accessor: (row) => (
        <div className="flex items-center space-x-2">
          <span className="font-bold text-rose-400">{row.currentStock}</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400">{row.minimumStock}</span>
        </div>
      ),
    },
    {
      header: 'Warehouse',
      accessor: (row) => <span className="text-xs text-slate-400">{row.warehouse || 'Main Bay'}</span>,
    },
  ];

  // Recent Stock Movements Table Columns
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
          className={`font-bold ${
            row.type === 'IN' ? 'text-emerald-400' : 'text-amber-400'
          }`}
        >
          {row.type === 'IN' ? '+' : '-'}{row.quantity}
        </span>
      ),
    },
    {
      header: 'Reason',
      accessor: (row) => <span className="text-xs text-slate-300">{row.reason || 'N/A'}</span>,
    },
    {
      header: 'Date & By',
      accessor: (row) => (
        <div className="flex flex-col text-[11px] text-slate-400">
          <span>{new Date(row.createdAt).toLocaleDateString()}</span>
          <span className="text-slate-500">{row.creator?.name || 'System'}</span>
        </div>
      ),
    },
  ];

  const roleVariant = user?.role ? (user.role.toLowerCase() as any) : 'default';

  return (
    <div className="space-y-6">
      {/* Top Banner & Refresh Bar */}
      <div className="p-6 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border border-slate-800 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h2 className="text-xl font-black text-slate-100">Welcome back, {user?.name}!</h2>
            <Badge variant={roleVariant}>{user?.role}</Badge>
          </div>
          <p className="text-xs text-slate-400">
            Real-time wholesale operational metrics & inventory tracking
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {lastUpdated && (
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Updated at {lastUpdated}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            isLoading={isLoading}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={fetchDashboardData}
          >
            Refresh Metrics
          </Button>
        </div>
      </div>

      {/* 5 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Customers */}
        <div
          onClick={() => navigate('/customers')}
          className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Customers</span>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-100 mt-3">{kpis.totalCustomers}</div>
          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
            Active Accounts & Leads <ArrowRight className="w-3 h-3 text-slate-500" />
          </span>
        </div>

        {/* Total Products */}
        <div
          onClick={() => navigate('/products')}
          className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Products</span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-100 mt-3">{kpis.totalProducts}</div>
          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
            Master Catalog Items <ArrowRight className="w-3 h-3 text-slate-500" />
          </span>
        </div>

        {/* Low Stock Alerts */}
        <div
          onClick={() => navigate('/inventory')}
          className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Stock</span>
            <div className={`p-2.5 rounded-xl group-hover:scale-110 transition-transform ${kpis.lowStockCount > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-3xl font-black mt-3 ${kpis.lowStockCount > 0 ? 'text-rose-400' : 'text-slate-100'}`}>
            {kpis.lowStockCount}
          </div>
          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
            {kpis.lowStockCount > 0 ? 'Requires Restock Action' : 'Stock Levels Optimal'}
          </span>
        </div>

        {/* Total Challans */}
        <div
          onClick={() => navigate('/challans')}
          className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Challans</span>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-100 mt-3">{kpis.totalChallans}</div>
          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
            Total Sales Challans <ArrowRight className="w-3 h-3 text-slate-500" />
          </span>
        </div>

        {/* Today's Challans */}
        <div
          onClick={() => navigate('/challans')}
          className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's</span>
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-100 mt-3">{kpis.todaysChallans}</div>
          <span className="text-[11px] text-indigo-400 flex items-center gap-1 mt-1 font-medium">
            Created Today <TrendingUp className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Delivery Challans */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-slate-100">Recent Sales Challans</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/challans')}>
                View All
              </Button>
            </div>

            {metrics?.recentChallans && metrics.recentChallans.length > 0 ? (
              <Table
                columns={challanColumns}
                data={metrics.recentChallans}
                keyExtractor={(row) => row.id}
              />
            ) : (
              <EmptyState title="No Recent Challans" description="No sales delivery challans generated yet." />
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-slate-100">Low Stock Product Thresholds</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/inventory')}>
                Manage Stock
              </Button>
            </div>

            {metrics?.lowStockProducts && metrics.lowStockProducts.length > 0 ? (
              <Table
                columns={lowStockColumns}
                data={metrics.lowStockProducts}
                keyExtractor={(row) => row.id}
              />
            ) : (
              <EmptyState
                icon={<Package className="w-10 h-10 text-emerald-500" />}
                title="Stock Levels Healthy"
                description="All inventory items are currently above minimum threshold levels."
              />
            )}
          </div>
        </div>
      </div>

      {/* Recent Stock Movements Full Row */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Boxes className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100">Recent Inventory Stock Movements</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/inventory')}>
            View Full Movements Audit
          </Button>
        </div>

        {metrics?.recentStockMovements && metrics.recentStockMovements.length > 0 ? (
          <Table
            columns={movementColumns}
            data={metrics.recentStockMovements}
            keyExtractor={(row) => row.id}
          />
        ) : (
          <EmptyState title="No Stock Movements" description="No inward or outward stock transactions recorded." />
        )}
      </div>
    </div>
  );
};
