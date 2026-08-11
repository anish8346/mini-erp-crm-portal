import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Pagination as PaginationType } from '../../types';

export interface PaginationProps {
  pagination: PaginationType;
  onPageChange: (newPage: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
  const { page, limit, totalCount, totalPages, hasNextPage, hasPrevPage } = pagination;

  const startCount = (page - 1) * limit + 1;
  const endCount = Math.min(page * limit, totalCount);

  if (totalCount === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 px-2 text-xs text-[#424845]">
      <div>
        Showing <span className="font-semibold text-[#1B1C1C]">{startCount}</span> to{' '}
        <span className="font-semibold text-[#1B1C1C]">{endCount}</span> of{' '}
        <span className="font-semibold text-[#1B1C1C]">{totalCount}</span> records
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className="p-2 rounded border border-[#E2E8E4] bg-white text-[#424845] hover:bg-[#F6F3F2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-3 py-1.5 rounded bg-[#F0EDED] text-[#1B1C1C] font-medium border border-[#E2E8E4]">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="p-2 rounded border border-[#E2E8E4] bg-white text-[#424845] hover:bg-[#F6F3F2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

