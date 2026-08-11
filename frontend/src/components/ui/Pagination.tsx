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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 px-2 text-xs text-slate-400">
      <div>
        Showing <span className="font-semibold text-slate-200">{startCount}</span> to{' '}
        <span className="font-semibold text-slate-200">{endCount}</span> of{' '}
        <span className="font-semibold text-slate-200">{totalCount}</span> records
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className="p-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 font-medium border border-slate-700">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="p-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
