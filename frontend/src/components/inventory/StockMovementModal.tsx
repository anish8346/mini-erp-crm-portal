import React, { useState, useEffect } from 'react';
import type { Product } from '../../types';
import { inventoryService } from '../../services/inventoryService';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useToast } from '../../context/ToastContext';

export interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'IN' | 'OUT';
  product?: Product | null;
  allProducts?: Product[];
  onSuccess: () => void;
}

export const StockMovementModal: React.FC<StockMovementModalProps> = ({
  isOpen,
  onClose,
  type,
  product,
  allProducts = [],
  onSuccess,
}) => {
  const { showSuccess, showError } = useToast();

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [reason, setReason] = useState<string>('');
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setSelectedProductId(product.id);
    } else if (allProducts.length > 0) {
      setSelectedProductId(allProducts[0].id);
    }
    setQuantity('1');
    setReason('');
    setIsConfirming(false);
    setError(null);
  }, [product, allProducts, isOpen]);

  const activeProduct = product || allProducts.find((p) => p.id === selectedProductId);

  const validate = () => {
    if (!activeProduct) {
      setError('Please select a product');
      return false;
    }

    const qtyNum = parseInt(quantity, 10);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setError('Quantity must be a positive integer greater than 0');
      return false;
    }

    if (type === 'OUT' && qtyNum > activeProduct.currentStock) {
      setError(
        `Insufficient stock! Requested: ${qtyNum}, Available: ${activeProduct.currentStock}`
      );
      return false;
    }

    setError(null);
    return true;
  };

  const handleStepToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsConfirming(true);
    }
  };

  const handleExecuteMovement = async () => {
    if (!activeProduct) return;
    const qtyNum = parseInt(quantity, 10);

    setIsLoading(true);
    setError(null);
    try {
      if (type === 'IN') {
        await inventoryService.stockIn(activeProduct.id, {
          quantity: qtyNum,
          reason: reason.trim() || 'Manual Purchase Receive',
        });
        showSuccess(`Added ${qtyNum} units of stock for ${activeProduct.productName}`);
      } else {
        await inventoryService.stockOut(activeProduct.id, {
          quantity: qtyNum,
          reason: reason.trim() || 'Manual Stock Issue',
        });
        showSuccess(`Issued ${qtyNum} units of stock for ${activeProduct.productName}`);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record stock movement');
      showError(err.message || 'Stock movement failed');
      setIsConfirming(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={type === 'IN' ? 'Stock IN — Add Inventory' : 'Stock OUT — Issue Inventory'}
      subtitle={
        type === 'IN'
          ? 'Receive purchase arrivals or stock additions'
          : 'Deduct stock for manual issue or damage disposal'
      }
      maxWidth="md"
      footer={
        isConfirming ? (
          <>
            <Button variant="ghost" onClick={() => setIsConfirming(false)} disabled={isLoading}>
              Back
            </Button>
            <Button
              variant={type === 'IN' ? 'primary' : 'danger'}
              onClick={handleExecuteMovement}
              isLoading={isLoading}
            >
              Confirm {type === 'IN' ? 'Stock IN' : 'Stock OUT'}
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant={type === 'IN' ? 'primary' : 'danger'}
              onClick={handleStepToConfirm}
            >
              Proceed to Confirm
            </Button>
          </>
        )
      }
    >
      {isConfirming && activeProduct ? (
        <div className="space-y-4">
          <div className="p-4 bg-[#F6F3F2] border border-[#E2E8E4] rounded-lg space-y-3">
            <h4 className="text-sm font-semibold text-[#1B1C1C]">Review Movement Details</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[#727875] block">Product:</span>
                <span className="font-semibold text-[#1B1C1C]">{activeProduct.productName}</span>
              </div>
              <div>
                <span className="text-[#727875] block">SKU:</span>
                <span className="font-mono text-[#4E635A] font-semibold">{activeProduct.sku}</span>
              </div>
              <div>
                <span className="text-[#727875] block">Current Stock:</span>
                <span className="font-mono font-bold text-[#1B1C1C]">{activeProduct.currentStock}</span>
              </div>
              <div>
                <span className="text-[#727875] block">New Stock After {type}:</span>
                <span
                  className={`font-mono font-bold ${
                    type === 'IN' ? 'text-[#2D5A27]' : 'text-[#7D562D]'
                  }`}
                >
                  {type === 'IN'
                    ? activeProduct.currentStock + parseInt(quantity, 10)
                    : activeProduct.currentStock - parseInt(quantity, 10)}
                </span>
              </div>
            </div>
            {reason && (
              <div className="text-xs border-t border-[#E2E8E4] pt-2 text-[#727875]">
                <span>Reason: </span>
                <span className="text-[#1B1C1C] italic">{reason}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleStepToConfirm} className="space-y-4">
          {error && <div className="text-xs text-[#BA1A1A] font-medium">{error}</div>}

          {!product && allProducts.length > 0 ? (
            <Select
              label="Select Product *"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              options={allProducts.map((p) => ({
                label: `${p.productName} (${p.sku}) — Stock: ${p.currentStock}`,
                value: p.id,
              }))}
            />
          ) : (
            activeProduct && (
              <div className="p-3 bg-[#F6F3F2] border border-[#E2E8E4] rounded text-xs space-y-1">
                <span className="text-[#727875]">Target Product:</span>
                <div className="font-bold text-[#1B1C1C]">{activeProduct.productName}</div>
                <div className="text-[11px] text-[#727875] font-mono">
                  SKU: {activeProduct.sku} • Current Stock: {activeProduct.currentStock} units
                </div>
              </div>
            )
          )}

          <Input
            label="Quantity *"
            type="number"
            min="1"
            placeholder="10"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />

          <Input
            label="Reason / Reference Note"
            placeholder={
              type === 'IN'
                ? 'e.g. Purchase order arrival PO-99'
                : 'e.g. Dispatched for showroom demo'
            }
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </form>
      )}
    </Modal>
  );
};

