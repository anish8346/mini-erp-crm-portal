import React, { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1B1C1C]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Positioner */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div
          className={`w-full ${widthClasses[maxWidth]} transform overflow-hidden rounded-lg bg-white border border-[#E2E8E4] p-6 text-left align-middle shadow-xl transition-all relative`}
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-[#E2E8E4]">
            <div>
              <h3 className="text-lg font-semibold text-[#1B1C1C]">{title}</h3>
              {subtitle && <p className="text-xs text-[#424845] mt-1">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-[#727875] hover:text-[#1B1C1C] transition-colors p-1 rounded hover:bg-[#F6F3F2]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="py-4 text-[#1B1C1C] text-sm">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="pt-4 border-t border-[#E2E8E4] flex items-center justify-end space-x-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

