import React, { useState } from 'react';
import { customerService } from '../../services/customerService';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../../context/ToastContext';

export interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
  onSuccess: () => void;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  isOpen,
  onClose,
  customerId,
  customerName,
  onSuccess,
}) => {
  const { showSuccess, showError } = useToast();

  const [note, setNote] = useState<string>('');
  const [followUpDate, setFollowUpDate] = useState<string>(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) {
      setError('Follow-up note is required');
      return;
    }
    if (!followUpDate) {
      setError('Next follow-up date is required');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await customerService.addFollowUp(customerId, {
        note: note.trim(),
        followUpDate: new Date(followUpDate).toISOString(),
      });
      showSuccess(`Follow-up logged for ${customerName}`);
      setNote('');
      onSuccess();
      onClose();
    } catch (err: any) {
      showError(err.message || 'Failed to log follow-up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Sales Follow-Up"
      subtitle={`Add follow-up activity note for ${customerName}`}
      maxWidth="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            Log Activity
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-xs text-[#BA1A1A] font-medium">{error}</div>}

        <Input
          label="Next Scheduled Follow-up Date *"
          type="datetime-local"
          value={followUpDate}
          onChange={(e) => setFollowUpDate(e.target.value)}
          required
        />

        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-medium text-[#424845] uppercase tracking-wider">
            Activity Note / Discussion Summary *
          </label>
          <textarea
            rows={4}
            required
            className="w-full bg-white border border-[#E2E8E4] text-[#1B1C1C] placeholder-[#727875] text-sm rounded p-3 focus:outline-none focus:ring-2 focus:ring-[#4E635A]/20 focus:border-[#4E635A]"
            placeholder="Details of call, pricing proposal sent, or client feedback..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};

