import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';
import { customerService, type CustomerListResponse } from '../services/customerService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Customer } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Table, type Column } from '../components/ui/Table';
import { Pagination } from '../components/ui/Pagination';
import { ErrorState } from '../components/ui/ErrorState';
import { Modal } from '../components/ui/Modal';
import { CustomerModal } from '../components/customers/CustomerModal';

export const CustomersPage: React.FC = () => {
  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [data, setData] = useState<CustomerListResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);

  // Modal State
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const canEdit = hasRole('ADMIN', 'SALES');
  const canDelete = hasRole('ADMIN');

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await customerService.getCustomers({
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        customerType: typeFilter !== 'ALL' ? typeFilter : undefined,
        page,
        limit,
      });
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customers');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, typeFilter, page, limit]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setIsCustomerModalOpen(true);
  };

  const handleOpenEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setIsCustomerModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await customerService.deleteCustomer(deleteTarget.id);
      showSuccess(`Customer '${deleteTarget.customerName}' deleted successfully`);
      setDeleteTarget(null);
      fetchCustomers();
    } catch (err: any) {
      showError(err.message || 'Failed to delete customer');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<Customer>[] = [
    {
      header: 'Customer',
      accessor: (row) => (
        <div className="flex flex-col">
          <button
            onClick={() => navigate(`/customers/${row.id}`)}
            className="font-bold text-[#1B1C1C] hover:text-[#4E635A] text-left transition-colors"
          >
            {row.customerName}
          </button>
          {row.email && (
            <span className="text-[11px] text-[#727875] flex items-center space-x-1 mt-0.5">
              <Mail className="w-3 h-3 text-[#727875] shrink-0" />
              <span className="truncate">{row.email}</span>
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Business / GST',
      accessor: (row) => (
        <div className="flex flex-col text-xs">
          <span className="font-medium text-[#1B1C1C]">{row.businessName || 'Individual'}</span>
          {row.gstNumber ? (
            <span className="text-[10px] text-[#4E635A] font-mono mt-0.5">{row.gstNumber}</span>
          ) : (
            <span className="text-[10px] text-[#727875]">Unregistered</span>
          )}
        </div>
      ),
    },
    {
      header: 'Mobile',
      accessor: (row) => (
        <div className="flex items-center space-x-1.5 text-xs text-[#1B1C1C] font-mono">
          <Phone className="w-3 h-3 text-[#727875] shrink-0" />
          <span>{row.mobileNumber}</span>
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: (row) => (
        <Badge variant={row.customerType.toLowerCase() as any}>{row.customerType}</Badge>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge variant={row.status.toLowerCase() as any}>{row.status}</Badge>
      ),
    },
    {
      header: 'Follow-up Date',
      accessor: (row) => (
        <div className="flex items-center space-x-1.5 text-xs text-[#424845]">
          <Calendar className="w-3 h-3 text-[#727875] shrink-0" />
          <span>
            {row.followUpDate ? new Date(row.followUpDate).toLocaleDateString() : 'None Scheduled'}
          </span>
        </div>
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
            onClick={() => navigate(`/customers/${row.id}`)}
          >
            <Eye className="w-4 h-4 text-[#4E635A]" />
          </Button>

          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              title="Edit Customer"
              onClick={() => handleOpenEditModal(row)}
            >
              <Edit2 className="w-4 h-4 text-[#7D562D]" />
            </Button>
          )}

          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              title="Delete Customer"
              onClick={() => setDeleteTarget(row)}
            >
              <Trash2 className="w-4 h-4 text-[#BA1A1A]" />
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
            <Users className="w-6 h-6 text-[#4E635A]" />
            <span>Customer CRM Accounts</span>
          </h2>
          <p className="text-xs text-[#727875] mt-1">
            Wholesale buyers, distributors, leads, and CRM activity logs
          </p>
        </div>

        {canEdit && (
          <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />} onClick={handleOpenAddModal}>
            Add New Customer
          </Button>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 bg-white p-4 border border-[#E2E8E4] rounded-lg shadow-2xs">
        <div className="sm:col-span-2">
          <Input
            placeholder="Search customer name, mobile, email, or business..."
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
            { label: 'Lead', value: 'LEAD' },
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Inactive', value: 'INACTIVE' },
          ]}
        />

        <Select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          options={[
            { label: 'All Types', value: 'ALL' },
            { label: 'Retail', value: 'RETAIL' },
            { label: 'Wholesale', value: 'WHOLESALE' },
            { label: 'Distributor', value: 'DISTRIBUTOR' },
          ]}
        />
      </div>

      {/* Main Table View */}
      {error ? (
        <ErrorState title="Failed to Load Customers" message={error} onRetry={fetchCustomers} />
      ) : (
        <div className="space-y-4">
          <Table
            columns={columns}
            data={data?.customers || []}
            keyExtractor={(row) => row.id}
            isLoading={isLoading}
            emptyMessage="No customers match the search and filter criteria."
          />

          {data?.pagination && (
            <Pagination pagination={data.pagination} onPageChange={(p) => setPage(p)} />
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customer={editingCustomer}
        onSuccess={fetchCustomers}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Customer Deletion"
        subtitle="This action is permanent and cannot be undone."
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm} isLoading={isDeleting}>
              Delete Customer
            </Button>
          </>
        }
      >
        <p className="text-sm text-[#1B1C1C]">
          Are you sure you want to permanently delete customer account{' '}
          <strong className="text-[#1B1C1C] font-bold">{deleteTarget?.customerName}</strong>?
        </p>
      </Modal>
    </div>
  );
};

