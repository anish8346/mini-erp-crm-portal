import React, { useState, useEffect } from 'react';
import type { Product } from '../../types';
import { productService } from '../../services/productService';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../../context/ToastContext';

export interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSuccess: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onSuccess,
}) => {
  const { showSuccess, showError } = useToast();
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    productName: '',
    sku: '',
    category: '',
    unitPrice: '',
    minimumStock: '',
    warehouse: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      setFormData({
        productName: product.productName || '',
        sku: product.sku || '',
        category: product.category || '',
        unitPrice: product.unitPrice !== undefined ? String(product.unitPrice) : '',
        minimumStock: product.minimumStock !== undefined ? String(product.minimumStock) : '',
        warehouse: product.warehouse || '',
      });
    } else {
      setFormData({
        productName: '',
        sku: '',
        category: '',
        unitPrice: '0',
        minimumStock: '5',
        warehouse: 'Main Warehouse',
      });
    }
    setErrors({});
  }, [product, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    }
    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU code is required';
    }
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    const priceNum = parseFloat(formData.unitPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      newErrors.unitPrice = 'Unit price must be greater than or equal to 0';
    }
    const minStockNum = parseInt(formData.minimumStock, 10);
    if (isNaN(minStockNum) || minStockNum < 0) {
      newErrors.minimumStock = 'Minimum stock must be 0 or greater';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const payload: Partial<Product> = {
        productName: formData.productName.trim(),
        sku: formData.sku.trim().toUpperCase(),
        category: formData.category.trim(),
        unitPrice: parseFloat(formData.unitPrice),
        minimumStock: parseInt(formData.minimumStock, 10),
        warehouse: formData.warehouse.trim() || null,
      };

      if (isEditing && product) {
        await productService.updateProduct(product.id, payload);
        showSuccess(`Product '${payload.productName}' updated successfully`);
      } else {
        await productService.createProduct(payload);
        showSuccess(`Product '${payload.productName}' created successfully`);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((e: any) => {
          if (e.field) fieldErrors[e.field] = e.message;
        });
        setErrors(fieldErrors);
      }
      showError(err.message || 'Failed to save product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Product Catalog Item' : 'Add New Product'}
      subtitle={
        isEditing
          ? 'Update product details, pricing & safety stock limits'
          : 'Create a new inventory catalog product'
      }
      maxWidth="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Create Product'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Product Name *"
            placeholder="Industrial Electric Motor"
            value={formData.productName}
            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
            error={errors.productName}
            required
          />

          <Input
            label="SKU Code *"
            placeholder="MOT-ELC-001"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
            error={errors.sku}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Category *"
            placeholder="Motors & Drives"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            error={errors.category}
            required
          />

          <Input
            label="Unit Price (₹) *"
            type="number"
            step="0.01"
            min="0"
            placeholder="4999.00"
            value={formData.unitPrice}
            onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
            error={errors.unitPrice}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Minimum Safety Stock Threshold *"
            type="number"
            min="0"
            placeholder="10"
            value={formData.minimumStock}
            onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
            error={errors.minimumStock}
            helperText="Alert triggered when stock falls to or below this count"
            required
          />

          <Input
            label="Warehouse / Storage Location"
            placeholder="Warehouse Bay A-12"
            value={formData.warehouse}
            onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
          />
        </div>

        {isEditing && product && (
          <div className="p-3 bg-[#F6F3F2] border border-[#E2E8E4] rounded flex items-center justify-between text-xs text-[#727875]">
            <span>Current Available Stock:</span>
            <span className="font-bold text-[#1B1C1C] font-mono">{product.currentStock} units</span>
          </div>
        )}
      </form>
    </Modal>
  );
};

