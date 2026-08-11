import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'An Error Occurred',
  message,
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-rose-950/20 border border-rose-800/40 rounded-2xl">
      <div className="p-3 bg-rose-900/40 rounded-xl mb-3 text-rose-400">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-rose-200">{title}</h3>
      <p className="text-xs text-rose-300/80 max-w-md mt-1 mb-5">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
