import React, { useState, useEffect } from 'react';
import type { Customer, CustomerType, CustomerStatus } from '../../types';
import { customerService } from '../../services/customerService';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useToast } from '../../context/ToastContext';

export interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null;
  onSuccess: () => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  customer,
  onSuccess,
}) => {
  const { showSuccess, showError } = useToast();
  const isEditing = !!customer;

  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    email: '',
    businessName: '',
    gstNumber: '',
    customerType: 'RETAIL' as CustomerType,
    status: 'LEAD' as CustomerStatus,
    address: '',
    followUpDate: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        customerName: customer.customerName || '',
        mobileNumber: customer.mobileNumber || '',
        email: customer.email || '',
        businessName: customer.businessName || '',
        gstNumber: customer.gstNumber || '',
        customerType: customer.customerType || 'RETAIL',
        status: customer.status || 'LEAD',
        address: customer.address || '',
        followUpDate: customer.followUpDate
          ? new Date(customer.followUpDate).toISOString().slice(0, 16)
          : '',
        notes: customer.notes || '',
      });
    } else {
      setFormData({
        customerName: '',
        mobileNumber: '',
        email: '',
        businessName: '',
        gstNumber: '',
        customerType: 'RETAIL',
        status: 'LEAD',
        address: '',
        followUpDate: '',
        notes: '',
      });
    }
    setErrors({});
  }, [customer, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.customerName.trim() || formData.customerName.trim().length < 2) {
      newErrors.customerName = 'Customer name must be at least 2 characters';
    }
    if (!formData.mobileNumber.trim() || formData.mobileNumber.trim().length < 10) {
      newErrors.mobileNumber = 'Mobile number must be at least 10 digits';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Invalid email address';
    }
    if (formData.gstNumber && formData.gstNumber.trim().length > 0 && formData.gstNumber.trim().length !== 15) {
      newErrors.gstNumber = 'GSTIN must be 15 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const payload: Partial<Customer> = {
        customerName: formData.customerName.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        email: formData.email.trim() || null,
        businessName: formData.businessName.trim() || null,
        gstNumber: formData.gstNumber.trim() || null,
        customerType: formData.customerType,
        status: formData.status,
        address: formData.address.trim() || null,
        followUpDate: formData.followUpDate ? new Date(formData.followUpDate).toISOString() : null,
        notes: formData.notes.trim() || null,
      };

      if (isEditing && customer) {
        await customerService.updateCustomer(customer.id, payload);
        showSuccess(`Customer '${payload.customerName}' updated successfully`);
      } else {
        await customerService.createCustomer(payload);
        showSuccess(`Customer '${payload.customerName}' created successfully`);
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
      showError(err.message || 'Failed to save customer');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Customer Account' : 'Add New Customer'}
      subtitle={isEditing ? 'Update customer profile details' : 'Register a new customer or lead'}
      maxWidth="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Create Customer'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Customer Name *"
            placeholder="John Doe"
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            error={errors.customerName}
            required
          />

          <Input
            label="Mobile Number *"
            placeholder="9876543210"
            value={formData.mobileNumber}
            onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
            error={errors.mobileNumber}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
          />

          <Input
            label="Business Name"
            placeholder="Apex Traders Pvt Ltd"
            value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="GSTIN Number"
            placeholder="27AAAAA0000A1Z5"
            value={formData.gstNumber}
            onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
            error={errors.gstNumber}
          />

          <Select
            label="Customer Type"
            value={formData.customerType}
            onChange={(e) => setFormData({ ...formData, customerType: e.target.value as CustomerType })}
            options={[
              { label: 'Retail', value: 'RETAIL' },
              { label: 'Wholesale', value: 'WHOLESALE' },
              { label: 'Distributor', value: 'DISTRIBUTOR' },
            ]}
          />

          <Select
            label="Pipeline Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
            options={[
              { label: 'Lead', value: 'LEAD' },
              { label: 'Active', value: 'ACTIVE' },
              { label: 'Inactive', value: 'INACTIVE' },
            ]}
          />
        </div>

        <Input
          label="Next Follow-up Date"
          type="datetime-local"
          value={formData.followUpDate}
          onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
        />

        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Billing / Delivery Address
          </label>
          <textarea
            rows={2}
            className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Full physical address details..."
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Account Notes
          </label>
          <textarea
            rows={2}
            className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Special billing, bulk discount, or delivery notes..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>
      </form>
    </Modal>
  );
};
