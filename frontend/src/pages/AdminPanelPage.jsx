import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import RoleBadge from '../components/ui/RoleBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function AdminPanelPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosClient.get('/api/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Could not fetch user registry.');
    } finally {
      setLoading(false);
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      setActionLoading(true);
      setError(null);
      await axiosClient.patch(`/api/users/${userId}/role`, { role: newRole });
      
      // Update local state
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error('Failed to update user role:', err);
      setError(err.response?.data?.message || 'Error occurred while updating user role.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendUser = async (userId) => {
    if (!window.confirm('Are you absolutely sure you want to suspend this user? This will delete their profile access.')) {
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      await axiosClient.delete(`/api/users/${userId}`);
      
      // Remove from local state
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Failed to suspend user:', err);
      setError(err.response?.data?.message || 'Error occurred while suspending user.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <PageHeader
        title="Admin Control Center 🛠️"
        subtitle="Manage user permissions, update platform roles, and govern the system state."
      />

      {error && (
        <div className="p-4 bg-danger/10 border border-danger/20 text-danger rounded-2xl text-xs font-semibold">
          ⚠️ {error}
        </div>
      )}

      <section className="bg-surface border border-border p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-text-primary tracking-tight font-sans">User Governance Registry</h2>
            <p className="text-xs text-text-muted">Modify student roles, upgrade curators, or terminate access locks</p>
          </div>
          {actionLoading && <LoadingSpinner size="sm" />}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner size="md" /></div>
        ) : users.length === 0 ? (
          <p className="text-xs text-text-muted italic text-center py-6">No users found in the system registry.</p>
        ) : (
          <div className="overflow-hidden border border-border rounded-xl">
            <table className="min-w-full divide-y divide-border text-sm text-left">
              <thead className="bg-surface-sidebar text-text-muted text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Role Authority</th>
                  <th className="px-4 py-3">Actions</th>
                  <th className="px-4 py-3 text-right">Suspend Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-sidebar/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-text-primary">
                      {user.displayName || user.name || user.email.split('@')[0]}
                    </td>
                    <td className="px-4 py-3 text-text-muted">{user.email}</td>
                    <td className="px-4 py-3">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={actionLoading}
                        className="h-8 px-2 rounded-md text-xs bg-surface-sidebar border border-border text-text-primary cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand"
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="TUTOR">TUTOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={actionLoading}
                        onClick={() => handleSuspendUser(user.id)}
                        className="text-danger hover:text-danger hover:bg-danger/10"
                      >
                        Suspend User
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
