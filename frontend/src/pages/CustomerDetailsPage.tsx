import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Mail,
  Building,
  Calendar,
  Clock,
  Plus,
  Edit2,
  MessageSquare,
  MapPin,
  FileSpreadsheet,
} from 'lucide-react';
import { customerService } from '../services/customerService';
import { useAuth } from '../context/AuthContext';
import type { Customer, FollowUp } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { CustomerModal } from '../components/customers/CustomerModal';
import { FollowUpModal } from '../components/customers/FollowUpModal';

export const CustomerDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState<boolean>(false);

  const canEdit = hasRole('ADMIN', 'SALES');

  const fetchCustomerDetails = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [custData, followUpData] = await Promise.all([
        customerService.getCustomerById(id),
        customerService.getFollowUps(id),
      ]);
      setCustomer(custData);
      setFollowUps(followUpData);
    } catch (err: any) {
      setError(err.message || 'Failed to load customer details');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCustomerDetails();
  }, [fetchCustomerDetails]);

  if (isLoading) {
    return <LoadingSpinner label="Loading customer CRM profile..." />;
  }

  if (error || !customer) {
    return (
      <ErrorState
        title="Customer Not Found"
        message={error || 'Unable to locate customer details'}
        onRetry={() => navigate('/customers')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/customers')}
          >
            Back to List
          </Button>
          <div>
            <h2 className="text-xl font-bold text-slate-100">{customer.customerName}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {customer.businessName ? `${customer.businessName} • ` : ''}ID: {customer.id}
            </p>
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="md"
              icon={<Edit2 className="w-4 h-4 text-amber-400" />}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Account
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsFollowUpModalOpen(true)}
            >
              Log Follow-Up
            </Button>
          </div>
        )}
      </div>

      {/* Profile & Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Account Profile Details */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account Status</span>
            <div className="flex items-center space-x-2">
              <Badge variant={customer.customerType.toLowerCase() as any}>{customer.customerType}</Badge>
              <Badge variant={customer.status.toLowerCase() as any}>{customer.status}</Badge>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex items-start space-x-3 text-slate-300">
              <Phone className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-xs text-slate-400">Mobile Number</span>
                <span className="font-semibold text-slate-100 font-mono">{customer.mobileNumber}</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-slate-300">
              <Mail className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-xs text-slate-400">Email Address</span>
                <span className="font-medium text-slate-200">{customer.email || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-slate-300">
              <Building className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-xs text-slate-400">Business / Firm</span>
                <span className="font-medium text-slate-200">{customer.businessName || 'Individual Account'}</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-slate-300">
              <FileSpreadsheet className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-xs text-slate-400">GSTIN Number</span>
                <span className="font-mono text-xs text-indigo-400 font-semibold">{customer.gstNumber || 'Unregistered'}</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-slate-300">
              <Calendar className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-xs text-slate-400">Next Scheduled Follow-up</span>
                <span className="font-semibold text-amber-400">
                  {customer.followUpDate ? new Date(customer.followUpDate).toLocaleString() : 'None Scheduled'}
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-slate-300">
              <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-xs text-slate-400">Address</span>
                <span className="text-xs text-slate-300">{customer.address || 'No physical address provided.'}</span>
              </div>
            </div>
          </div>

          {customer.notes && (
            <div className="pt-4 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Account Notes
              </span>
              <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                {customer.notes}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: CRM Activity Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-slate-100">CRM Sales Activity & Follow-Up History</h3>
              </div>

              {canEdit && (
                <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setIsFollowUpModalOpen(true)}>
                  Log Activity
                </Button>
              )}
            </div>

            {followUps.length === 0 ? (
              <EmptyState
                icon={<Clock className="w-10 h-10 text-slate-600" />}
                title="No Follow-Up Logs"
                description="No sales activity or follow-up notes logged for this customer yet."
                actionLabel={canEdit ? 'Log First Follow-Up' : undefined}
                onAction={() => setIsFollowUpModalOpen(true)}
              />
            ) : (
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
                {followUps.map((log) => (
                  <div key={log.id} className="relative flex items-start space-x-4 pl-8">
                    <div className="absolute left-1 top-1 w-5 h-5 rounded-full bg-slate-800 border-2 border-indigo-500 flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    </div>

                    <div className="flex-1 bg-slate-950/60 border border-slate-800 rounded-2xl p-4 shadow-md space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-400">
                        <span className="font-semibold text-indigo-400">
                          Logged by {log.creator?.name || 'Sales Rep'}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-sm text-slate-200 leading-relaxed">{log.note}</p>

                      <div className="text-[11px] text-amber-400 font-medium pt-1 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Scheduled Follow-up: {new Date(log.followUpDate).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Customer Modal */}
      <CustomerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        customer={customer}
        onSuccess={fetchCustomerDetails}
      />

      {/* Log FollowUp Modal */}
      <FollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        customerId={customer.id}
        customerName={customer.customerName}
        onSuccess={fetchCustomerDetails}
      />
    </div>
  );
};
