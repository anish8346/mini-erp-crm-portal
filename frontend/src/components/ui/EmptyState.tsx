import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <FolderOpen className="w-12 h-12 text-[#727875]" />,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-[#E2E8E4] rounded-lg">
      <div className="p-4 bg-[#F6F3F2] rounded-lg mb-4 border border-[#E2E8E4]">{icon}</div>
      <h3 className="text-base font-semibold text-[#1B1C1C]">{title}</h3>
      {description && <p className="text-xs text-[#424845] max-w-sm mt-1 mb-6">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

