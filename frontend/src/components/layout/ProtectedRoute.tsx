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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white border border-[#E2E8E4] rounded-lg shadow-2xs">
        <h2 className="text-xl font-semibold text-[#BA1A1A]">Access Restricted (403 Forbidden)</h2>
        <p className="text-xs text-[#424845] mt-2 max-w-md">
          Your current account role <span className="font-semibold text-[#1B1C1C]">({user?.role})</span> does not have permission to view this section.
        </p>
      </div>
    );
  }

  return <Outlet />;
};

