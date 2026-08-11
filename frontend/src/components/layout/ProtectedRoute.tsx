import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen label="Verifying session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !hasRole(...allowedRoles)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <h2 className="text-xl font-bold text-rose-400">Access Restricted (403 Forbidden)</h2>
        <p className="text-xs text-slate-400 mt-2 max-w-md">
          Your current account role <span className="font-semibold text-slate-200">({user?.role})</span> does not have permission to view this section.
        </p>
      </div>
    );
  }

  return <Outlet />;
};
