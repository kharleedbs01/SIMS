import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { FiPlus, FiEdit2, FiTrash2, FiBookOpen } from 'react-icons/fi';
import { subjectService } from '../../services/api';
import { Modal, Confirm, PageLoader, Empty, SearchBar, Badge } from '../../components/common/UI';
import { useToast } from '../../context/ToastContext';

const CAT_COLOR = { Core: 'blue', Elective: 'green', Vocational: 'yellow' };

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
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
    try { const { data } = await subjectService.getAll({ search }); setSubjects(data.subjects); }
    catch { toast('Failed', 'error'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetch(); }, [fetch]);

  const openAdd = () => { setEditing(null); reset({ category: 'Core' }); setModalOpen(true); };
  const openEdit = (s) => { setEditing(s); reset({ name: s.name, code: s.code, category: s.category, description: s.description }); setModalOpen(true); };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editing) { await subjectService.update(editing._id, data); toast('Updated', 'success'); }
      else { await subjectService.create(data); toast('Created', 'success'); }
      setModalOpen(false); fetch();
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await subjectService.delete(deleteId); toast('Deleted', 'success'); setDeleteId(null); fetch(); }
    catch { toast('Delete failed', 'error'); }
    finally { setDeleting(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Subjects</h1><p className="text-sm text-gray-500">{subjects.length} subjects</p></div>
        <button onClick={openAdd} className="btn-primary"><FiPlus size={16} />Add Subject</button>
      </div>

      <div className="card p-4 mb-4">
        <SearchBar value={search} onChange={v => setSearch(v)} placeholder="Search subjects..." className="max-w-sm" />
      </div>

      <div className="card overflow-hidden">
        {loading ? <PageLoader /> : subjects.length === 0 ? (
          <Empty icon={FiBookOpen} title="No subjects" action={<button onClick={openAdd} className="btn-primary mx-auto">Add Subject</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>
                <th className="table-th">#</th>
                <th className="table-th">Subject</th>
                <th className="table-th">Code</th>
                <th className="table-th">Category</th>
                <th className="table-th hidden md:table-cell">Teachers</th>
                <th className="table-th text-right">Actions</th>
              </tr></thead>
              <tbody>
                {subjects.map((s, i) => (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="table-td text-gray-400 text-xs">{i + 1}</td>
                    <td className="table-td font-medium text-gray-900">{s.name}</td>
                    <td className="table-td font-mono text-xs font-bold text-gray-600">{s.code}</td>
                    <td className="table-td"><Badge color={CAT_COLOR[s.category] || 'gray'}>{s.category}</Badge></td>
                    <td className="table-td hidden md:table-cell text-xs text-gray-500">{s.teachers?.length || 0} teacher(s)</td>
                    <td className="table-td text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-700 hover:bg-primary-50"><FiEdit2 size={14} /></button>
                        <button onClick={() => setDeleteId(s._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"><FiTrash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Subject' : 'Add Subject'} size="sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="form-label">Subject Name *</label>
            <input className="form-input" placeholder="e.g. Mathematics" {...register('name', { required: 'Required' })} />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>
          <div>
            <label className="form-label">Code *</label>
            <input className="form-input" placeholder="e.g. MTH" {...register('code', { required: 'Required' })} />
            {errors.code && <p className="form-error">{errors.code.message}</p>}
          </div>
          <div>
            <label className="form-label">Category</label>
            <select className="form-input" {...register('category')}><option>Core</option><option>Elective</option><option>Vocational</option></select>
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={2} {...register('description')} />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Add'}</button>
          </div>
        </form>
      </Modal>

      <Confirm open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} title="Delete Subject" />
    </div>
  );
}
