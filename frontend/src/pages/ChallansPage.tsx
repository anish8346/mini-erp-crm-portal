import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { challanService, type ChallanListResponse } from '../services/challanService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Challan } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Table, type Column } from '../components/ui/Table';
import { Pagination } from '../components/ui/Pagination';
import { ErrorState } from '../components/ui/ErrorState';
import { Modal } from '../components/ui/Modal';

export const ChallansPage: React.FC = () => {
  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [data, setData] = useState<ChallanListResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);

  // Quick Action Modal State
  const [confirmTarget, setConfirmTarget] = useState<Challan | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Challan | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const canManage = hasRole('ADMIN', 'SALES', 'WAREHOUSE');

  const fetchChallans = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await challanService.getChallans({
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        page,
        limit,
      });
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sales delivery challans');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, page, limit]);

  useEffect(() => {
    fetchChallans();
  }, [fetchChallans]);

  const handleConfirmExecute = async () => {
    if (!confirmTarget) return;
    setIsProcessing(true);
    setActionError(null);
    try {
      await challanService.confirmChallan(confirmTarget.id);
      showSuccess(`Challan '${confirmTarget.challanNumber}' CONFIRMED!`);
      setConfirmTarget(null);
      fetchChallans();
    } catch (err: any) {
      const msg = err.message || 'Failed to confirm challan';
      setActionError(msg);
      showError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelExecute = async () => {
    if (!cancelTarget) return;
    setIsProcessing(true);
    setActionError(null);
    try {
      await challanService.cancelChallan(cancelTarget.id);
      showSuccess(`Challan '${cancelTarget.challanNumber}' CANCELLED.`);
      setCancelTarget(null);
      fetchChallans();
    } catch (err: any) {
      const msg = err.message || 'Failed to cancel challan';
      setActionError(msg);
      showError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const columns: Column<Challan>[] = [
    {
      header: 'Challan #',
      accessor: (row) => (
        <button
          onClick={() => navigate(`/challans/${row.id}`)}
          className="font-bold text-[#4E635A] font-mono hover:underline text-left"
        >
          {row.challanNumber}
        </button>
      ),
    },
    {
      header: 'Customer Account',
      accessor: (row) => (
        <div className="flex flex-col text-xs">
          <span className="font-semibold text-[#1B1C1C]">{row.customer?.customerName || 'N/A'}</span>
          {row.customer?.businessName && (
            <span className="text-[10px] text-[#727875]">{row.customer.businessName}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Total Quantity',
      accessor: (row) => (
        <span className="font-semibold font-mono text-[#1B1C1C]">{row.totalQuantity} units</span>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge variant={row.status.toLowerCase() as any}>{row.status}</Badge>
      ),
    },
    {
      header: 'Created By',
      accessor: (row) => (
        <span className="text-xs text-[#424845]">{row.creator?.name || 'System'}</span>
      ),
    },
    {
      header: 'Created Date',
      accessor: (row) => (
        <span className="text-xs text-[#727875] font-mono">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (row) => (
        <div className="flex items-center justify-end space-x-1">
          <Button
            variant="ghost"
            size="sm"
            title="View Details"
            onClick={() => navigate(`/challans/${row.id}`)}
          >
            <Eye className="w-4 h-4 text-[#4E635A]" />
          </Button>

          {canManage && row.status === 'DRAFT' && (
            <Button
              variant="ghost"
              size="sm"
              title="Confirm Challan"
              onClick={() => {
                setActionError(null);
                setConfirmTarget(row);
              }}
            >
              <CheckCircle className="w-4 h-4 text-[#2D5A27]" />
            </Button>
          )}

          {canManage && row.status !== 'CANCELLED' && (
            <Button
              variant="ghost"
              size="sm"
              title="Cancel Challan"
              onClick={() => {
                setActionError(null);
                setCancelTarget(row);
              }}
            >
              <XCircle className="w-4 h-4 text-[#BA1A1A]" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8E4]">
        <div>
          <h2 className="text-xl font-bold text-[#1B1C1C] flex items-center space-x-2">
            <FileText className="w-6 h-6 text-[#4E635A]" />
            <span>Sales Delivery Challans</span>
          </h2>
          <p className="text-xs text-[#727875] mt-1">
            Dispatch documents, item snapshots, stock verification & confirmation workflow
          </p>
        </div>

        {canManage && (
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/challans/new')}
          >
            Create New Challan
          </Button>
        )}
      </div>

      {/* Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 border border-[#E2E8E4] rounded-lg shadow-2xs items-center">
        <div className="sm:col-span-2">
          <Input
            placeholder="Search by Challan # (e.g. CH-000001) or customer name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="w-4 h-4 text-[#727875]" />}
          />
        </div>

        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          options={[
            { label: 'All Statuses', value: 'ALL' },
            { label: 'Draft Only', value: 'DRAFT' },
            { label: 'Confirmed Only', value: 'CONFIRMED' },
            { label: 'Cancelled Only', value: 'CANCELLED' },
          ]}
        />
      </div>

      {/* Table */}
      {error ? (
        <ErrorState title="Failed to Load Challans" message={error} onRetry={fetchChallans} />
      ) : (
        <div className="space-y-4">
          <Table
            columns={columns}
            data={data?.challans || []}
            keyExtractor={(row) => row.id}
            isLoading={isLoading}
            emptyMessage="No sales delivery challans match search criteria."
          />

          {data?.pagination && (
            <Pagination pagination={data.pagination} onPageChange={(p) => setPage(p)} />
          )}
        </div>
      )}

      {/* Confirm Quick Dialog */}
      <Modal
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        title="Confirm Delivery Challan"
        subtitle="Verifies stock availability and deducts inventory."
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmTarget(null)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmExecute} isLoading={isProcessing}>
              Confirm Challan
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {actionError && <div className="text-xs text-[#BA1A1A] font-medium">{actionError}</div>}
          <p className="text-sm text-[#1B1C1C]">
            Confirm challan{' '}
            <strong className="text-[#4E635A] font-bold font-mono">{confirmTarget?.challanNumber}</strong>?
          </p>
        </div>
      </Modal>

      {/* Cancel Quick Dialog */}
      <Modal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel Delivery Challan"
        subtitle="Cancels delivery challan record."
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCancelTarget(null)} disabled={isProcessing}>
              Close
            </Button>
            <Button variant="danger" onClick={handleCancelExecute} isLoading={isProcessing}>
              Cancel Challan
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {actionError && <div className="text-xs text-[#BA1A1A] font-medium">{actionError}</div>}
          <p className="text-sm text-[#1B1C1C]">
            Are you sure you want to cancel challan{' '}
            <strong className="text-[#BA1A1A] font-bold font-mono">{cancelTarget?.challanNumber}</strong>?
          </p>
        </div>
      </Modal>
    </div>
  );
};

