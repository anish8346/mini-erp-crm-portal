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
        <span className="font-semibold text-[#4E635A] font-mono text-xs">{row.challanNumber}</span>
      ),
    },
    {
      header: 'Customer',
      accessor: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-[#1B1C1C]">{row.customer?.customerName || 'N/A'}</span>
          {row.customer?.businessName && (
            <span className="text-[10px] text-[#727875]">{row.customer.businessName}</span>
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
      accessor: (row) => <span className="font-medium text-[#1B1C1C]">{row.totalQuantity} units</span>,
    },
    {
      header: 'Created Date',
      accessor: (row) => (
        <span className="text-[#424845] text-xs">{new Date(row.createdAt).toLocaleDateString()}</span>
      ),
    },
  ];

  // Low Stock Table Columns
  const lowStockColumns: Column<Product>[] = [
    {
      header: 'Product Name',
      accessor: (row) => <span className="font-medium text-[#1B1C1C]">{row.productName}</span>,
    },
    {
      header: 'SKU',
      accessor: (row) => <span className="font-mono text-xs text-[#727875]">{row.sku}</span>,
    },
    {
      header: 'Current / Min Stock',
      accessor: (row) => (
        <div className="flex items-center space-x-2">
          <span className="font-bold text-[#BA1A1A]">{row.currentStock}</span>
          <span className="text-[#C2C8C4]">/</span>
          <span className="text-[#424845]">{row.minimumStock}</span>
        </div>
      ),
    },
    {
      header: 'Warehouse',
      accessor: (row) => <span className="text-xs text-[#424845]">{row.warehouse || 'Main Bay'}</span>,
    },
  ];

  // Recent Stock Movements Table Columns
  const movementColumns: Column<StockMovement>[] = [
    {
      header: 'Product',
      accessor: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-[#1B1C1C]">{row.product?.productName || 'N/A'}</span>
          <span className="text-[10px] text-[#727875] font-mono">{row.product?.sku}</span>
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
            row.type === 'IN' ? 'text-[#2D5A27]' : 'text-[#7D562D]'
          }`}
        >
          {row.type === 'IN' ? '+' : '-'}{row.quantity}
        </span>
      ),
    },
    {
      header: 'Reason',
      accessor: (row) => <span className="text-xs text-[#424845]">{row.reason || 'N/A'}</span>,
    },
    {
      header: 'Date & By',
      accessor: (row) => (
        <div className="flex flex-col text-[11px] text-[#424845]">
          <span>{new Date(row.createdAt).toLocaleDateString()}</span>
          <span className="text-[#727875]">{row.creator?.name || 'System'}</span>
        </div>
      ),
    },
  ];

  const roleVariant = user?.role ? (user.role.toLowerCase() as any) : 'default';

  return (
    <div className="space-y-6">
      {/* Top Banner & Refresh Bar */}
      <div className="p-6 bg-white border border-[#E2E8E4] rounded-lg shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h2 className="text-xl font-bold text-[#1B1C1C]">Welcome back, {user?.name}!</h2>
            <Badge variant={roleVariant}>{user?.role}</Badge>
          </div>
          <p className="text-xs text-[#727875]">
            Real-time wholesale operational metrics & inventory tracking
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {lastUpdated && (
            <span className="text-[11px] text-[#727875] hidden sm:inline">
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
          className="p-5 bg-white border border-[#E2E8E4] rounded-lg shadow-2xs hover:border-[#8DA399] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#424845] uppercase tracking-wider">Customers</span>
            <div className="p-2 bg-[#F6F3F2] text-[#4E635A] rounded group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[#1B1C1C] mt-3">{kpis.totalCustomers}</div>
          <span className="text-[11px] text-[#727875] flex items-center gap-1 mt-1">
            Active Accounts & Leads <ArrowRight className="w-3 h-3 text-[#727875]" />
          </span>
        </div>

        {/* Total Products */}
        <div
          onClick={() => navigate('/products')}
          className="p-5 bg-white border border-[#E2E8E4] rounded-lg shadow-2xs hover:border-[#8DA399] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#424845] uppercase tracking-wider">Products</span>
            <div className="p-2 bg-[#F6F3F2] text-[#4E635A] rounded group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[#1B1C1C] mt-3">{kpis.totalProducts}</div>
          <span className="text-[11px] text-[#727875] flex items-center gap-1 mt-1">
            Master Catalog Items <ArrowRight className="w-3 h-3 text-[#727875]" />
          </span>
        </div>

        {/* Low Stock Alerts */}
        <div
          onClick={() => navigate('/inventory')}
          className="p-5 bg-white border border-[#E2E8E4] rounded-lg shadow-2xs hover:border-[#8DA399] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#424845] uppercase tracking-wider">Low Stock</span>
            <div className={`p-2 rounded group-hover:scale-105 transition-transform ${kpis.lowStockCount > 0 ? 'bg-[#FCE8E6] text-[#BA1A1A]' : 'bg-[#F6F3F2] text-[#727875]'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-3xl font-bold mt-3 ${kpis.lowStockCount > 0 ? 'text-[#BA1A1A]' : 'text-[#1B1C1C]'}`}>
            {kpis.lowStockCount}
          </div>
          <span className="text-[11px] text-[#727875] flex items-center gap-1 mt-1">
            {kpis.lowStockCount > 0 ? 'Requires Restock Action' : 'Stock Levels Optimal'}
          </span>
        </div>

        {/* Total Challans */}
        <div
          onClick={() => navigate('/challans')}
          className="p-5 bg-white border border-[#E2E8E4] rounded-lg shadow-2xs hover:border-[#8DA399] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#424845] uppercase tracking-wider">Challans</span>
            <div className="p-2 bg-[#F6F3F2] text-[#4E635A] rounded group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[#1B1C1C] mt-3">{kpis.totalChallans}</div>
          <span className="text-[11px] text-[#727875] flex items-center gap-1 mt-1">
            Total Sales Challans <ArrowRight className="w-3 h-3 text-[#727875]" />
          </span>
        </div>

        {/* Today's Challans */}
        <div
          onClick={() => navigate('/challans')}
          className="p-5 bg-white border border-[#E2E8E4] rounded-lg shadow-2xs hover:border-[#8DA399] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#424845] uppercase tracking-wider">Today's</span>
            <div className="p-2 bg-[#F6F3F2] text-[#4E635A] rounded group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[#1B1C1C] mt-3">{kpis.todaysChallans}</div>
          <span className="text-[11px] text-[#4E635A] flex items-center gap-1 mt-1 font-medium">
            Created Today <TrendingUp className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Delivery Challans */}
        <div className="bg-white border border-[#E2E8E4] rounded-lg p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E2E8E4]">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-[#4E635A]" />
                <h3 className="text-base font-semibold text-[#1B1C1C]">Recent Sales Challans</h3>
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
        <div className="bg-white border border-[#E2E8E4] rounded-lg p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E2E8E4]">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-[#BA1A1A]" />
                <h3 className="text-base font-semibold text-[#1B1C1C]">Low Stock Product Thresholds</h3>
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
                icon={<Package className="w-10 h-10 text-[#2D5A27]" />}
                title="Stock Levels Healthy"
                description="All inventory items are currently above minimum threshold levels."
              />
            )}
          </div>
        </div>
      </div>

      {/* Recent Stock Movements Full Row */}
      <div className="bg-white border border-[#E2E8E4] rounded-lg p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E2E8E4]">
          <div className="flex items-center space-x-2">
            <Boxes className="w-5 h-5 text-[#7D562D]" />
            <h3 className="text-base font-semibold text-[#1B1C1C]">Recent Inventory Stock Movements</h3>
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

