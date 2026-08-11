import React from 'react';
import { UserCheck } from 'lucide-react';

export const UsersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-xl font-bold text-slate-100">User Access Management</h2>
        <p className="text-xs text-slate-400 mt-1">System user roles, accounts & permissions (ADMIN Only)</p>
      </div>

      <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
        <UserCheck className="w-12 h-12 text-purple-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-200">User Management Foundation Ready</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
          RBAC protected route verified. System accounts list and role switcher view initialized for ADMIN users.
        </p>
      </div>
    </div>
  );
};
