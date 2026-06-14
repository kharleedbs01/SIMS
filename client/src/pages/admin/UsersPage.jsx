import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { FiPlus, FiEdit2, FiTrash2, FiShield, FiRefreshCw, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { userService } from '../../services/api';
import { Modal, Confirm, PageLoader, Empty, SearchBar, Badge, StatusBadge } from '../../components/common/UI';
import { useToast } from '../../context/ToastContext';

const ROLE_COLOR = { admin: 'purple', teacher: 'green', student: 'blue' };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [resetModal, setResetModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { register: regReset, handleSubmit: handleReset, reset: resetForm } = useForm();

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await userService.getAll({ search, role: filterRole });
      setUsers(data.users);
    } catch { toast('Failed to load users', 'error'); }
    finally { setLoading(false); }
  }, [search, filterRole]);

  useEffect(() => { fetch(); }, [fetch]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await userService.create(data);
      toast('User created successfully', 'success');
      setModalOpen(false);
      reset();
      fetch();
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const onResetPassword = async (data) => {
    setSaving(true);
    try {
      await userService.resetPassword(resetModal._id, { newPassword: data.newPassword });
      toast('Password reset successfully', 'success');
      setResetModal(null);
      resetForm();
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const toggleStatus = async (user) => {
    try {
      const { data } = await userService.toggleStatus(user._id);
      toast(`User ${data.isActive ? 'activated' : 'deactivated'}`, 'success');
      fetch();
    } catch { toast('Failed', 'error'); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await userService.delete(deleteId);
      toast('User deleted', 'success');
      setDeleteId(null);
      fetch();
    } catch (err) { toast(err.response?.data?.message || 'Delete failed', 'error'); }
    finally { setDeleting(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">User Accounts</h1><p className="text-sm text-gray-500">{users.length} accounts</p></div>
        <button onClick={() => { reset(); setModalOpen(true); }} className="btn-primary"><FiPlus size={16} />Create User</button>
      </div>

      <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={v => setSearch(v)} placeholder="Search by name or email..." className="flex-1" />
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="form-input w-full sm:w-36">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? <PageLoader /> : users.length === 0 ? (
          <Empty icon={FiShield} title="No users found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>
                <th className="table-th">User</th>
                <th className="table-th">Role</th>
                <th className="table-th hidden md:table-cell">Last Login</th>
                <th className="table-th">Status</th>
                <th className="table-th text-right">Actions</th>
              </tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-600 text-xs font-bold">{u.name?.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td"><Badge color={ROLE_COLOR[u.role] || 'gray'}>{u.role}</Badge></td>
                    <td className="table-td hidden md:table-cell text-xs text-gray-500">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never'}
                    </td>
                    <td className="table-td">
                      <Badge color={u.isActive ? 'green' : 'red'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="table-td text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => toggleStatus(u)} title={u.isActive ? 'Deactivate' : 'Activate'}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary-700 hover:bg-primary-50">
                          {u.isActive ? <FiToggleRight size={16} className="text-green-600" /> : <FiToggleLeft size={16} />}
                        </button>
                        <button onClick={() => setResetModal(u)} title="Reset Password"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-yellow-600 hover:bg-yellow-50">
                          <FiRefreshCw size={14} />
                        </button>
                        <button onClick={() => setDeleteId(u._id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create User Account" size="sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="form-label">Full Name *</label>
            <input className="form-input" {...register('name', { required: 'Required' })} />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>
          <div>
            <label className="form-label">Email *</label>
            <input type="email" className="form-input" {...register('email', { required: 'Required' })} />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>
          <div>
            <label className="form-label">Password *</label>
            <input type="password" className="form-input" {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })} />
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>
          <div>
            <label className="form-label">Role *</label>
            <select className="form-input" {...register('role', { required: 'Required' })}>
              <option value="">Select role</option>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
            {errors.role && <p className="form-error">{errors.role.message}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create User'}</button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal open={!!resetModal} onClose={() => setResetModal(null)} title={`Reset Password — ${resetModal?.name}`} size="sm">
        <form onSubmit={handleReset(onResetPassword)} className="space-y-4">
          <div>
            <label className="form-label">New Password *</label>
            <input type="password" className="form-input" placeholder="Min 6 characters"
              {...regReset('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t">
            <button type="button" onClick={() => setResetModal(null)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Resetting...' : 'Reset Password'}</button>
          </div>
        </form>
      </Modal>

      <Confirm open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        loading={deleting} title="Delete User" message="This permanently deletes the account and cannot be undone." />
    </div>
  );
}
