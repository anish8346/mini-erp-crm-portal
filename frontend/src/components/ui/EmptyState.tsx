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
  icon = <FolderOpen className="w-12 h-12 text-slate-600" />,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
      <div className="p-4 bg-slate-800/60 rounded-2xl mb-4 border border-slate-700/50">{icon}</div>
      <h3 className="text-base font-bold text-slate-200">{title}</h3>
      {description && <p className="text-xs text-slate-400 max-w-sm mt-1 mb-6">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
