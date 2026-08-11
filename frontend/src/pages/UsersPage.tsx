import React, { useEffect, useState } from 'react';
import { UserCheck, Search, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userService } from '../services/userService';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import type { User, Role } from '../types';

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data);
      setIsLoading(false);
    } catch (err: any) {
      showError(err.message || 'Failed to fetch user accounts');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(
        users.filter(
          (u) =>
            u.name.toLowerCase().includes(term) ||
            u.email.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, users]);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    setUpdatingUserId(userId);
    try {
      await userService.updateUser(userId, { role: newRole });
      showSuccess('User role updated successfully');
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      showError(err.message || 'Failed to update user role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    setUpdatingUserId(userId);
    const newStatus = !currentStatus;
    try {
      await userService.updateUser(userId, { isActive: newStatus });
      showSuccess(`User account ${newStatus ? 'activated' : 'deactivated'} successfully`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: newStatus } : u))
      );
    } catch (err: any) {
      showError(err.message || 'Failed to toggle user status');
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8E4]">
        <div>
          <h2 className="text-xl font-bold text-[#1B1C1C]">User Access Management</h2>
          <p className="text-xs text-[#727875] mt-1">System user roles, accounts & permissions (ADMIN Only)</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          onClick={fetchUsers}
          disabled={isLoading}
        >
          Refresh List
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-[#727875]" />}
          />
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="p-12 text-center bg-white border border-[#E2E8E4] rounded-lg shadow-2xs">
          <div className="w-8 h-8 rounded-full border-2 border-[#4E635A] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#727875]">Fetching user accounts...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#E2E8E4] rounded-lg shadow-2xs">
          <UserCheck className="w-12 h-12 text-[#727875] mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[#1B1C1C]">No Users Found</h3>
          <p className="text-xs text-[#727875] mt-1">
            {searchTerm ? 'No user accounts match your search query.' : 'No user accounts are registered in the system.'}
          </p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-lg border border-[#E2E8E4] bg-white">
          <table className="w-full text-left text-sm text-[#1B1C1C]">
            <thead className="bg-[#F0EDED] text-xs font-medium uppercase tracking-wider text-[#424845] border-b border-[#E2E8E4]">
              <tr>
                <th className="px-4 py-3">User Details</th>
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3">System Role</th>
                <th className="px-4 py-3">Account Status</th>
                <th className="px-4 py-3">Member Since</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8E4]">
              {filteredUsers.map((u) => {
                const isSelf = currentUser?.id === u.id;
                const isPendingUpdate = updatingUserId === u.id;

                return (
                  <tr
                    key={u.id}
                    className="hover:bg-[#F2F4F6] transition-colors duration-150 odd:bg-[#FCF9F8] even:bg-white"
                  >
                    <td className="px-4 py-2.5 align-middle">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#EAE7E7] text-[#1B1C1C] flex items-center justify-center font-bold text-xs">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-semibold text-sm text-[#1B1C1C]">
                            {u.name}
                          </span>
                          {isSelf && (
                            <span className="text-[10px] bg-[#D1E8DD] text-[#263932] px-1.5 py-0.5 rounded font-bold uppercase">
                              YOU
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 align-middle font-medium text-[#424845]">
                      {u.email}
                    </td>
                    <td className="px-4 py-2.5 align-middle">
                      {isSelf ? (
                        <Badge variant="admin">{u.role}</Badge>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                          disabled={isPendingUpdate}
                          className="bg-white border border-[#E2E8E4] text-[#1B1C1C] text-xs rounded focus:outline-none focus:ring-1 focus:ring-[#4E635A] focus:border-[#4E635A] px-2 py-1 cursor-pointer font-medium uppercase"
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="SALES">SALES</option>
                          <option value="WAREHOUSE">WAREHOUSE</option>
                          <option value="ACCOUNTS">ACCOUNTS</option>
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-2.5 align-middle">
                      <Badge variant={u.isActive ? 'active' : 'inactive'}>
                        {u.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 align-middle text-xs text-[#727875]">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-2.5 align-middle text-right">
                      {isSelf ? (
                        <span className="text-[11px] text-[#727875] italic">Protected Self</span>
                      ) : (
                        <Button
                          variant={u.isActive ? 'outline' : 'primary'}
                          size="sm"
                          className={u.isActive ? 'text-[#BA1A1A] hover:bg-[#FCE8E6]' : ''}
                          onClick={() => handleStatusToggle(u.id, !!u.isActive)}
                          disabled={isPendingUpdate}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
