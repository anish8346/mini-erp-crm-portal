import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Building,
  Calendar,
  CheckCircle,
  XCircle,
  Package,
  AlertTriangle,
} from 'lucide-react';
import { challanService } from '../services/challanService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Challan } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorState } from '../components/ui/ErrorState';
import { Modal } from '../components/ui/Modal';

export const ChallanDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [challan, setChallan] = useState<Challan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog States
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const canManage = hasRole('ADMIN', 'SALES', 'WAREHOUSE');

  const fetchChallan = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await challanService.getChallanById(id);
      if (data.items) {
        data.items = data.items.map((item) => ({
          ...item,
          unitPriceSnapshot: Number(item.unitPriceSnapshot),
          totalPrice: Number(item.totalPrice),
        }));
      }
      setChallan(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load delivery challan details');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchChallan();
  }, [fetchChallan]);

  const handleConfirmChallan = async () => {
    if (!id) return;
    setIsProcessing(true);
    setActionError(null);
    try {
      const updated = await challanService.confirmChallan(id);
      showSuccess(`Sales Challan '${updated.challanNumber}' CONFIRMED! Inventory stock updated.`);
      setIsConfirmModalOpen(false);
      fetchChallan();
    } catch (err: any) {
      const errMsg = err.message || 'Failed to confirm delivery challan';
      setActionError(errMsg);
      showError(errMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelChallan = async () => {
    if (!id) return;
    setIsProcessing(true);
    setActionError(null);
    try {
      const updated = await challanService.cancelChallan(id);
      showSuccess(`Sales Challan '${updated.challanNumber}' CANCELLED.`);
      setIsCancelModalOpen(false);
      fetchChallan();
    } catch (err: any) {
      const errMsg = err.message || 'Failed to cancel delivery challan';
      setActionError(errMsg);
      showError(errMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading delivery challan record..." />;
  }

  if (error || !challan) {
    return (
      <ErrorState
        title="Challan Not Found"
        message={error || 'Unable to locate sales challan'}
        onRetry={() => navigate('/challans')}
      />
    );
  }

  const grandTotal =
    challan.items?.reduce((sum, item) => sum + item.quantity * item.unitPriceSnapshot, 0) || 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8E4]">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/challans')}
          >
            Back to List
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold text-[#1B1C1C] font-mono">{challan.challanNumber}</h2>
              <Badge variant={challan.status.toLowerCase() as any}>{challan.status}</Badge>
            </div>
            <p className="text-xs text-[#727875] mt-0.5">
              Created on {new Date(challan.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {canManage && (
          <div className="flex items-center space-x-3">
            {challan.status === 'DRAFT' && (
              <Button
                variant="primary"
                size="md"
                icon={<CheckCircle className="w-4 h-4" />}
                onClick={() => {
                  setActionError(null);
                  setIsConfirmModalOpen(true);
                }}
              >
                Confirm Challan
              </Button>
            )}

            {challan.status !== 'CANCELLED' && (
              <Button
                variant="outline"
                size="md"
                icon={<XCircle className="w-4 h-4 text-[#BA1A1A]" />}
                onClick={() => {
                  setActionError(null);
                  setIsCancelModalOpen(true);
                }}
              >
                Cancel Challan
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Customer & Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="bg-white border border-[#E2E8E4] rounded-lg p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-semibold text-[#1B1C1C] flex items-center space-x-2 pb-3 border-b border-[#E2E8E4]">
            <Building className="w-4 h-4 text-[#4E635A]" />
            <span>Customer Account Details</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#727875]">Customer Name:</span>
              <span className="font-bold text-[#1B1C1C]">{challan.customer?.customerName || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#727875]">Business / Firm:</span>
              <span className="font-medium text-[#1B1C1C]">{challan.customer?.businessName || 'Individual'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#727875]">Mobile:</span>
              <span className="font-mono text-[#1B1C1C]">{challan.customer?.mobileNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#727875]">GSTIN:</span>
              <span className="font-mono text-[#4E635A] font-semibold">
                {challan.customer?.gstNumber || 'Unregistered'}
              </span>
            </div>
          </div>
        </div>

        {/* Challan Metadata */}
        <div className="bg-white border border-[#E2E8E4] rounded-lg p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-semibold text-[#1B1C1C] flex items-center space-x-2 pb-3 border-b border-[#E2E8E4]">
            <FileText className="w-4 h-4 text-[#4E635A]" />
            <span>Delivery Challan Overview</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#727875]">Challan Number:</span>
              <span className="font-mono font-bold text-[#4E635A]">{challan.challanNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#727875]">Status:</span>
              <Badge variant={challan.status.toLowerCase() as any}>{challan.status}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-[#727875]">Created By:</span>
              <span className="font-medium text-[#1B1C1C]">{challan.creator?.name || 'System User'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#727875]">Total Items:</span>
              <span className="font-semibold text-[#1B1C1C]">{challan.items?.length || 0} product(s)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Snapshot Breakdown Table */}
      <div className="bg-white border border-[#E2E8E4] rounded-lg p-6 shadow-2xs space-y-6">
        <div className="flex items-center space-x-2 pb-3 border-b border-[#E2E8E4]">
          <Package className="w-5 h-5 text-[#4E635A]" />
          <h3 className="text-base font-semibold text-[#1B1C1C]">Product Line Items (Immutable Snapshots)</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#1B1C1C]">
            <thead className="bg-[#F0EDED] uppercase text-[10px] text-[#424845] font-medium border-b border-[#E2E8E4]">
              <tr>
                <th className="px-4 py-3.5">Product Name (Snapshot)</th>
                <th className="px-4 py-3.5">SKU (Snapshot)</th>
                <th className="px-4 py-3.5 text-right">Unit Price (Snapshot)</th>
                <th className="px-4 py-3.5 text-center">Quantity</th>
                <th className="px-4 py-3.5 text-right">Total Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8E4]">
              {challan.items?.map((item) => (
                <tr key={item.id} className="hover:bg-[#FCF9F8]">
                  <td className="px-4 py-3.5 font-bold text-[#1B1C1C]">{item.productNameSnapshot}</td>
                  <td className="px-4 py-3.5 font-mono text-[#4E635A]">{item.skuSnapshot}</td>
                  <td className="px-4 py-3.5 text-right">₹{item.unitPriceSnapshot.toFixed(2)}</td>
                  <td className="px-4 py-3.5 text-center font-bold text-[#1B1C1C]">{item.quantity}</td>
                  <td className="px-4 py-3.5 text-right font-bold text-[#1B1C1C]">
                    ₹{(item.quantity * item.unitPriceSnapshot).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="bg-[#F6F3F2] p-4 rounded border border-[#E2E8E4] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-2 text-[#727875]">
            <Calendar className="w-4 h-4 text-[#727875]" />
            <span>Last Updated: {new Date(challan.updatedAt).toLocaleString()}</span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-right">
              <span className="text-[#727875] block text-[10px]">TOTAL QUANTITY</span>
              <span className="text-base font-bold font-mono text-[#1B1C1C]">{challan.totalQuantity} units</span>
            </div>
            <div className="text-right pl-6 border-l border-[#E2E8E4]">
              <span className="text-[#727875] block text-[10px]">GRAND TOTAL</span>
              <span className="text-lg font-bold text-[#4E635A]">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Sales Delivery Challan"
        subtitle="Executes inventory stock reduction inside an atomic database transaction."
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsConfirmModalOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmChallan} isLoading={isProcessing}>
              Confirm & Deduct Stock
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {actionError && (
            <div className="p-3 bg-[#FCE8E6] border border-[#FFDAD6] rounded text-xs text-[#BA1A1A] flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-[#BA1A1A] shrink-0 mt-0.5" />
              <span>{actionError}</span>
            </div>
          )}

          <p className="text-sm text-[#1B1C1C]">
            Are you sure you want to confirm delivery challan{' '}
            <strong className="text-[#4E635A] font-bold font-mono">{challan.challanNumber}</strong>?
          </p>
          <div className="p-3 bg-[#F6F3F2] border border-[#E2E8E4] rounded text-xs text-[#424845] space-y-1">
            <div className="font-semibold text-[#1B1C1C]">System Transaction Guarantee:</div>
            <div>• Verifies live stock availability for all items.</div>
            <div>• Decrements inventory stock & records OUT stock movements.</div>
            <div>• If any product has insufficient stock, the operation will be rejected.</div>
          </div>
        </div>
      </Modal>

      {/* Cancellation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Sales Delivery Challan"
        subtitle="Cancels challan and executes stock restock reversal if already confirmed."
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsCancelModalOpen(false)} disabled={isProcessing}>
              Close
            </Button>
            <Button variant="danger" onClick={handleCancelChallan} isLoading={isProcessing}>
              Cancel Challan
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {actionError && (
            <div className="p-3 bg-[#FCE8E6] border border-[#FFDAD6] rounded text-xs text-[#BA1A1A] flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-[#BA1A1A] shrink-0 mt-0.5" />
              <span>{actionError}</span>
            </div>
          )}

          <p className="text-sm text-[#1B1C1C]">
            Are you sure you want to cancel delivery challan{' '}
            <strong className="text-[#BA1A1A] font-bold font-mono">{challan.challanNumber}</strong>?
          </p>
        </div>
      </Modal>
    </div>
  );
};

