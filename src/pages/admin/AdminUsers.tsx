import { useEffect, useState, useCallback } from 'react';
import { Search, Users, UserCheck, UserX, Shield, Phone, Building, Save } from 'lucide-react';
import { supabase, type Profile } from '../../lib/supabase';
import { Card, Badge, Button, Input, Select, Avatar, Modal, EmptyState, Skeleton } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { DashboardPageHeader } from '../../components/layout/DashboardLayout';

const roleColors: Record<string, 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple'> = {
  user: 'gray',
  admin: 'red',
  technician: 'purple',
};

export function AdminUsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editUser, setEditUser] = useState<Profile | null>(null);
  const [editForm, setEditForm] = useState({ full_name: '', phone: '', department: '', role: 'user', is_active: true });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers((data as Profile[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter((u) => {
    const matchesSearch = !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const openEdit = (user: Profile) => {
    setEditUser(user);
    setEditForm({
      full_name: user.full_name,
      phone: user.phone || '',
      department: user.department || '',
      role: user.role,
      is_active: user.is_active,
    });
  };

  const handleSave = async () => {
    if (!editUser) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editForm.full_name,
        phone: editForm.phone,
        department: editForm.department,
        role: editForm.role,
        is_active: editForm.is_active,
      })
      .eq('id', editUser.id);
    setSaving(false);
    if (error) {
      toast('error', 'Update failed', error.message);
    } else {
      toast('success', 'User updated!');
      setEditUser(null);
      load();
    }
  };

  const toggleActive = async (user: Profile) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !user.is_active })
      .eq('id', user.id);
    if (error) toast('error', 'Update failed');
    else {
      toast('success', user.is_active ? 'User deactivated' : 'User activated');
      load();
    }
  };

  const stats = {
    total: users.length,
    active: users.filter((u) => u.is_active).length,
    admins: users.filter((u) => u.role === 'admin').length,
    technicians: users.filter((u) => u.role === 'technician').length,
  };

  return (
    <div>
      <DashboardPageHeader
        title="User Management"
        description="View, edit, and manage all user accounts."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center mb-2">
            <Users className="w-4.5 h-4.5" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{loading ? <Skeleton className="w-10 h-6" /> : stats.total}</div>
          <div className="text-xs text-slate-500">Total Users</div>
        </Card>
        <Card className="p-4">
          <div className="w-9 h-9 rounded-lg bg-success-50 text-success-600 flex items-center justify-center mb-2">
            <UserCheck className="w-4.5 h-4.5" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{loading ? <Skeleton className="w-10 h-6" /> : stats.active}</div>
          <div className="text-xs text-slate-500">Active</div>
        </Card>
        <Card className="p-4">
          <div className="w-9 h-9 rounded-lg bg-error-50 text-error-600 flex items-center justify-center mb-2">
            <Shield className="w-4.5 h-4.5" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{loading ? <Skeleton className="w-10 h-6" /> : stats.admins}</div>
          <div className="text-xs text-slate-500">Admins</div>
        </Card>
        <Card className="p-4">
          <div className="w-9 h-9 rounded-lg bg-accent-50 text-accent-600 flex items-center justify-center mb-2">
            <UserCheck className="w-4.5 h-4.5" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{loading ? <Skeleton className="w-10 h-6" /> : stats.technicians}</div>
          <div className="text-xs text-slate-500">Technicians</div>
        </Card>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              icon={<Search className="w-4 h-4" />}
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="sm:w-48">
            <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
              <option value="technician">Technicians</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={<Users className="w-7 h-7" />} title="No users found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-slate-600 uppercase px-4 py-3">User</th>
                  <th className="text-left text-xs font-semibold text-slate-600 uppercase px-4 py-3 hidden md:table-cell">Department</th>
                  <th className="text-left text-xs font-semibold text-slate-600 uppercase px-4 py-3">Role</th>
                  <th className="text-left text-xs font-semibold text-slate-600 uppercase px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-slate-600 uppercase px-4 py-3 hidden lg:table-cell">Joined</th>
                  <th className="text-right text-xs font-semibold text-slate-600 uppercase px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.full_name} src={user.avatar_url} size="sm" />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">{user.full_name}</p>
                          <p className="text-xs text-slate-500 truncate">{user.id === editUser?.id ? '' : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-sm text-slate-700">{user.department || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={roleColors[user.role]}>{user.role}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {user.is_active ? (
                        <Badge color="green"><UserCheck className="w-3 h-3" /> Active</Badge>
                      ) : (
                        <Badge color="red"><UserX className="w-3 h-3" /> Inactive</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-sm text-slate-700">{new Date(user.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(user)}
                          className="px-2.5 py-1 text-xs rounded-md text-primary-700 bg-primary-50 hover:bg-primary-100 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggleActive(user)}
                          className={`px-2.5 py-1 text-xs rounded-md font-medium ${
                            user.is_active
                              ? 'text-error-700 bg-error-50 hover:bg-error-100'
                              : 'text-success-700 bg-success-50 hover:bg-success-100'
                          }`}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Edit Modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit User" size="md">
        {editUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <Avatar name={editUser.full_name} src={editUser.avatar_url} size="md" />
              <div>
                <p className="font-medium text-slate-900">{editUser.full_name}</p>
                <p className="text-xs text-slate-500">User ID: {editUser.id.slice(0, 8)}...</p>
              </div>
            </div>

            <Input
              label="Full Name"
              icon={<Users className="w-4 h-4" />}
              value={editForm.full_name}
              onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone"
                icon={<Phone className="w-4 h-4" />}
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
              <Input
                label="Department"
                icon={<Building className="w-4 h-4" />}
                value={editForm.department}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
              />
            </div>
            <Select
              label="Role"
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'user' | 'admin' | 'technician' })}
            >
              <option value="user">User</option>
              <option value="technician">Technician</option>
              <option value="admin">Admin</option>
            </Select>
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={editForm.is_active}
                onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              Account active
            </label>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="ghost" onClick={() => setEditUser(null)}>Cancel</Button>
              <Button onClick={handleSave} loading={saving}>
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
