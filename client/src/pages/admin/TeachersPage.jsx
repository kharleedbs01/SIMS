import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { FiPlus, FiEdit2, FiTrash2, FiUser } from 'react-icons/fi';
import { teacherService, subjectService, classService } from '../../services/api';
import { Modal, Confirm, PageLoader, Empty, SearchBar, StatusBadge, Badge } from '../../components/common/UI';
import { useToast } from '../../context/ToastContext';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await teacherService.getAll({ search });
      setTeachers(data.teachers);
    } catch { toast('Failed to load', 'error'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => {
    subjectService.getAll().then(r => setSubjects(r.data.subjects));
    classService.getAll().then(r => setClasses(r.data.classes));
  }, []);

  const openAdd = () => { setEditing(null); reset(); setModalOpen(true); };
  const openEdit = (t) => {
    setEditing(t);
    reset({
      fullName: t.fullName, gender: t.gender, phone: t.phone,
      qualification: t.qualification, address: t.address,
      specialization: t.specialization, status: t.status,
      assignedClasses: t.assignedClasses?.map(c => c._id) || [],
      assignedSubjects: t.assignedSubjects?.map(s => s._id) || [],
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    // Convert multi-select to arrays
    if (typeof data.assignedClasses === 'string') data.assignedClasses = [data.assignedClasses].filter(Boolean);
    if (typeof data.assignedSubjects === 'string') data.assignedSubjects = [data.assignedSubjects].filter(Boolean);
    setSaving(true);
    try {
      if (editing) { await teacherService.update(editing._id, data); toast('Teacher updated', 'success'); }
      else { await teacherService.create(data); toast('Teacher created', 'success'); }
      setModalOpen(false); fetch();
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await teacherService.delete(deleteId); toast('Teacher deleted', 'success'); setDeleteId(null); fetch(); }
    catch (err) { toast(err.response?.data?.message || 'Delete failed', 'error'); }
    finally { setDeleting(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Teachers</h1><p className="text-sm text-gray-500">{teachers.length} staff members</p></div>
        <button onClick={openAdd} className="btn-primary"><FiPlus size={16} />Add Teacher</button>
      </div>

      <div className="card p-4 mb-4">
        <SearchBar value={search} onChange={v => setSearch(v)} placeholder="Search by name or staff ID..." className="max-w-sm" />
      </div>

      <div className="card overflow-hidden">
        {loading ? <PageLoader /> : teachers.length === 0 ? (
          <Empty icon={FiUser} title="No teachers found" action={<button onClick={openAdd} className="btn-primary mx-auto">Add Teacher</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>
                <th className="table-th">Teacher</th>
                <th className="table-th hidden sm:table-cell">Staff ID</th>
                <th className="table-th hidden md:table-cell">Phone</th>
                <th className="table-th">Subjects</th>
                <th className="table-th hidden lg:table-cell">Classes</th>
                <th className="table-th">Status</th>
                <th className="table-th text-right">Actions</th>
              </tr></thead>
              <tbody>
                {teachers.map(t => (
                  <tr key={t._id} className="hover:bg-gray-50">
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-green-700 text-xs font-bold">{t.fullName?.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">{t.fullName}</p>
                          <p className="text-xs text-gray-400">{t.userId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td hidden sm:table-cell font-mono text-xs text-gray-600">{t.staffId}</td>
                    <td className="table-td hidden md:table-cell text-gray-600 text-sm">{t.phone || '—'}</td>
                    <td className="table-td">
                      <div className="flex flex-wrap gap-1">
                        {t.assignedSubjects?.slice(0, 2).map(s => <Badge key={s._id} color="blue">{s.code}</Badge>)}
                        {(t.assignedSubjects?.length || 0) > 2 && <Badge color="gray">+{t.assignedSubjects.length - 2}</Badge>}
                        {!t.assignedSubjects?.length && <span className="text-xs text-gray-400">None</span>}
                      </div>
                    </td>
                    <td className="table-td hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {t.assignedClasses?.slice(0, 3).map(c => <Badge key={c._id} color="green">{c.name}</Badge>)}
                        {(t.assignedClasses?.length || 0) > 3 && <Badge color="gray">+{t.assignedClasses.length - 3}</Badge>}
                      </div>
                    </td>
                    <td className="table-td"><StatusBadge status={t.status} /></td>
                    <td className="table-td text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-700 hover:bg-primary-50"><FiEdit2 size={14} /></button>
                        <button onClick={() => setDeleteId(t._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"><FiTrash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Teacher' : 'Add Teacher'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="form-label">Full Name *</label>
              <input className="form-input" {...register('fullName', { required: 'Name required' })} />
              {errors.fullName && <p className="form-error">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="form-label">Gender</label>
              <select className="form-input" {...register('gender')}><option value="">Select</option><option>Male</option><option>Female</option></select>
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input className="form-input" {...register('phone')} />
            </div>
            <div>
              <label className="form-label">Qualification *</label>
              <input className="form-input" placeholder="e.g. B.Sc Mathematics" {...register('qualification', { required: 'Required' })} />
              {errors.qualification && <p className="form-error">{errors.qualification.message}</p>}
            </div>
            <div>
              <label className="form-label">Specialization</label>
              <input className="form-input" {...register('specialization')} />
            </div>
            <div>
              <label className="form-label">Status</label>
              <select className="form-input" {...register('status')}><option>Active</option><option>On Leave</option><option>Resigned</option></select>
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Address</label>
              <textarea className="form-input" rows={2} {...register('address')} />
            </div>
            <div>
              <label className="form-label">Assign Subjects</label>
              <select multiple className="form-input h-28" {...register('assignedSubjects')}>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              <p className="text-xs text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple</p>
            </div>
            <div>
              <label className="form-label">Assign Classes</label>
              <select multiple className="form-input h-28" {...register('assignedClasses')}>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <p className="text-xs text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple</p>
            </div>
            {!editing && (
              <>
                <div>
                  <label className="form-label">Login Email *</label>
                  <input type="email" className="form-input" {...register('email', { required: 'Email required' })} />
                  {errors.email && <p className="form-error">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="form-label">Password</label>
                  <input type="password" className="form-input" {...register('password')} placeholder="Default: StaffID@sims" />
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Add Teacher'}</button>
          </div>
        </form>
      </Modal>

      <Confirm open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        loading={deleting} title="Delete Teacher" message="This will delete the teacher and their login account." />
    </div>
  );
}
