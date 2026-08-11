import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
  Building,
  Package,
  ShoppingBag,
  Check,
} from 'lucide-react';
import { customerService } from '../services/customerService';
import { productService } from '../services/productService';
import { challanService } from '../services/challanService';
import { useToast } from '../context/ToastContext';
import type { Customer, Product } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

interface ChallanDraftItem {
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  currentStock: number;
  quantity: number;
}

export const CreateChallanPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [draftItems, setDraftItems] = useState<ChallanDraftItem[]>([]);

  // Item Picker State
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [itemQuantity, setItemQuantity] = useState<string>('1');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const loadFormData = async () => {
      setIsLoadingData(true);
      try {
        const [custRes, prodRes] = await Promise.all([
          customerService.getCustomers({ limit: 100 }),
          productService.getProducts({ limit: 100 }),
        ]);
        setCustomers(custRes.customers);
        const parsedProducts = prodRes.products.map((p) => ({
          ...p,
          unitPrice: Number(p.unitPrice),
        }));
        setProducts(parsedProducts);

        if (custRes.customers.length > 0) {
          setSelectedCustomerId(custRes.customers[0].id);
        }
        if (prodRes.products.length > 0) {
          setSelectedProductId(prodRes.products[0].id);
        }
      } catch (err: any) {
        showError(err.message || 'Failed to load customers/products');
      } finally {
        setIsLoadingData(false);
      }
    };

    loadFormData();
  }, []);

  const activeProduct = products.find((p) => p.id === selectedProductId);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;

    const qtyNum = parseInt(itemQuantity, 10);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      showError('Item quantity must be a positive integer greater than 0');
      return;
    }

    // Check if product already added
    const existingIndex = draftItems.findIndex((item) => item.productId === activeProduct.id);
    if (existingIndex >= 0) {
      const updated = [...draftItems];
      updated[existingIndex].quantity += qtyNum;
      updated[existingIndex].unitPrice = Number(activeProduct.unitPrice);
      setDraftItems(updated);
    } else {
      setDraftItems((prev) => [
        ...prev,
        {
          productId: activeProduct.id,
          productName: activeProduct.productName,
          sku: activeProduct.sku,
          unitPrice: Number(activeProduct.unitPrice),
          currentStock: activeProduct.currentStock,
          quantity: qtyNum,
        },
      ]);
    }

    setItemQuantity('1');
    showSuccess(`Added ${activeProduct.productName} to challan items`);
  };

  const handleRemoveItem = (productId: string) => {
    setDraftItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleSaveDraftChallan = async () => {
    if (!selectedCustomerId) {
      showError('Please select a customer');
      return;
    }

    if (draftItems.length === 0) {
      showError('Please add at least one product item to the challan');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customerId: selectedCustomerId,
        items: draftItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const newChallan = await challanService.createChallan(payload);
      showSuccess(`Draft Sales Challan '${newChallan.challanNumber}' created successfully`);
      navigate(`/challans/${newChallan.id}`);
    } catch (err: any) {
      showError(err.message || 'Failed to create sales challan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalQuantity = draftItems.reduce((sum, item) => sum + item.quantity, 0);
  const grandTotal = draftItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  if (isLoadingData) {
    return <LoadingSpinner label="Loading customers & product catalog..." />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8E4]">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/challans')}
          >
            Back to Challans
          </Button>
          <div>
            <h2 className="text-xl font-bold text-[#1B1C1C] flex items-center space-x-2">
              <FileText className="w-6 h-6 text-[#4E635A]" />
              <span>Create Sales Delivery Challan</span>
            </h2>
            <p className="text-xs text-[#727875] mt-0.5">
              Draft challan creation does not modify stock. Stock is verified and deducted upon confirmation.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customer Selection & Product Picker */}
        <div className="lg:col-span-1 space-y-6">
          {/* Step 1: Customer Card */}
          <div className="bg-white border border-[#E2E8E4] rounded-lg p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-semibold text-[#1B1C1C] flex items-center space-x-2">
              <Building className="w-4 h-4 text-[#4E635A]" />
              <span>Step 1: Select Customer</span>
            </h3>

            {customers.length === 0 ? (
              <p className="text-xs text-[#BA1A1A]">No customers found. Please add a customer first.</p>
            ) : (
              <Select
                label="Customer Account *"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                options={customers.map((c) => ({
                  label: `${c.customerName}${c.businessName ? ` (${c.businessName})` : ''}`,
                  value: c.id,
                }))}
              />
            )}
          </div>

          {/* Step 2: Item Picker Card */}
          <div className="bg-white border border-[#E2E8E4] rounded-lg p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-semibold text-[#1B1C1C] flex items-center space-x-2">
              <Package className="w-4 h-4 text-[#4E635A]" />
              <span>Step 2: Add Products to Challan</span>
            </h3>

            {products.length === 0 ? (
              <p className="text-xs text-[#BA1A1A]">No catalog products found. Please add products first.</p>
            ) : (
              <form onSubmit={handleAddItem} className="space-y-4">
                <Select
                  label="Select Product *"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  options={products.map((p) => ({
                    label: `${p.productName} (${p.sku})`,
                    value: p.id,
                  }))}
                />

                {activeProduct && (
                  <div className="p-3 bg-[#F6F3F2] border border-[#E2E8E4] rounded text-xs space-y-1">
                    <div className="flex items-center justify-between text-[#727875]">
                      <span>SKU:</span>
                      <span className="font-mono text-[#4E635A] font-semibold">{activeProduct.sku}</span>
                    </div>
                    <div className="flex items-center justify-between text-[#727875]">
                      <span>Unit Price:</span>
                      <span className="font-semibold text-[#1B1C1C]">₹{activeProduct.unitPrice}</span>
                    </div>
                    <div className="flex items-center justify-between text-[#727875]">
                      <span>Live Stock:</span>
                      <span
                        className={`font-mono font-bold ${
                          activeProduct.currentStock <= activeProduct.minimumStock
                            ? 'text-[#7D562D]'
                            : 'text-[#2D5A27]'
                        }`}
                      >
                        {activeProduct.currentStock} units
                      </span>
                    </div>
                  </div>
                )}

                <Input
                  label="Quantity *"
                  type="number"
                  min="1"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(e.target.value)}
                  required
                />

                <Button
                  type="submit"
                  variant="secondary"
                  size="md"
                  className="w-full"
                  icon={<Plus className="w-4 h-4 text-[#4E635A]" />}
                >
                  Add Item to Challan
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Draft Items Table & Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#E2E8E4] rounded-lg p-6 shadow-2xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8E4]">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-[#4E635A]" />
                <h3 className="text-base font-semibold text-[#1B1C1C]">Challan Line Items</h3>
              </div>
              <span className="text-xs text-[#727875]">{draftItems.length} Product(s) Added</span>
            </div>

            {draftItems.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-[#E2E8E4] rounded text-[#727875] text-xs">
                No items added yet. Select a product on the left to add items to this delivery challan.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#1B1C1C]">
                  <thead className="bg-[#F0EDED] uppercase text-[10px] text-[#424845] font-medium border-b border-[#E2E8E4]">
                    <tr>
                      <th className="px-3 py-3">Product</th>
                      <th className="px-3 py-3">SKU</th>
                      <th className="px-3 py-3 text-right">Unit Price</th>
                      <th className="px-3 py-3 text-center">Qty</th>
                      <th className="px-3 py-3 text-right">Line Total</th>
                      <th className="px-3 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8E4]">
                    {draftItems.map((item) => (
                      <tr key={item.productId} className="hover:bg-[#FCF9F8]">
                        <td className="px-3 py-3 font-semibold text-[#1B1C1C]">{item.productName}</td>
                        <td className="px-3 py-3 font-mono text-[#4E635A]">{item.sku}</td>
                        <td className="px-3 py-3 text-right">₹{item.unitPrice.toFixed(2)}</td>
                        <td className="px-3 py-3 text-center font-bold text-[#1B1C1C]">{item.quantity}</td>
                        <td className="px-3 py-3 text-right font-bold text-[#1B1C1C]">
                          ₹{(item.quantity * item.unitPrice).toFixed(2)}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <button
                            onClick={() => handleRemoveItem(item.productId)}
                            className="p-1 text-[#727875] hover:text-[#BA1A1A] transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Summary Footer */}
            {draftItems.length > 0 && (
              <div className="pt-4 border-t border-[#E2E8E4] space-y-4">
                <div className="bg-[#F6F3F2] p-4 rounded border border-[#E2E8E4] space-y-2 text-xs">
                  <div className="flex justify-between text-[#727875]">
                    <span>Total Quantity:</span>
                    <span className="font-bold text-[#1B1C1C] font-mono">{totalQuantity} units</span>
                  </div>
                  <div className="flex justify-between text-[#424845] text-sm font-bold pt-2 border-t border-[#E2E8E4]">
                    <span className="text-[#1B1C1C]">Grand Total Amount:</span>
                    <span className="text-[#4E635A] text-base">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={isSubmitting}
                  onClick={handleSaveDraftChallan}
                  icon={<Check className="w-4 h-4" />}
                >
                  Save Draft Sales Challan
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

