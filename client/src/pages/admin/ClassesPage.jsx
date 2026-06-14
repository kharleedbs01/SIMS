import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { FiPlus, FiEdit2, FiTrash2, FiBook } from 'react-icons/fi';
import { classService, teacherService, subjectService } from '../../services/api';
import { Modal, Confirm, PageLoader, Empty, Badge } from '../../components/common/UI';
import { useToast } from '../../context/ToastContext';

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset } = useForm();

  const fetch = useCallback(async () => {
    setLoading(true);
    try { const { data } = await classService.getAll(); setClasses(data.classes); }
    catch { toast('Failed to load', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => {
    teacherService.getAll().then(r => setTeachers(r.data.teachers));
    subjectService.getAll().then(r => setSubjects(r.data.subjects));
  }, []);

  const openAdd = () => { setEditing(null); reset({ session: '2024/2025', term: 'First Term', capacity: 40 }); setModalOpen(true); };
  const openEdit = (c) => {
    setEditing(c);
    reset({ name: c.name, session: c.session, term: c.term, capacity: c.capacity, classTeacher: c.classTeacher?._id, subjects: c.subjects?.map(s => s._id) });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    if (typeof data.subjects === 'string') data.subjects = [data.subjects].filter(Boolean);
    setSaving(true);
    try {
      if (editing) { await classService.update(editing._id, data); toast('Class updated', 'success'); }
      else { await classService.create(data); toast('Class created', 'success'); }
      setModalOpen(false); fetch();
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await classService.delete(deleteId); toast('Deleted', 'success'); setDeleteId(null); fetch(); }
    catch (err) { toast(err.response?.data?.message || 'Cannot delete', 'error'); }
    finally { setDeleting(false); }
  };

  const ORDER = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'];
  const sorted = [...classes].sort((a, b) => ORDER.indexOf(a.name) - ORDER.indexOf(b.name));

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Classes</h1><p className="text-sm text-gray-500">{classes.length} classes</p></div>
        <button onClick={openAdd} className="btn-primary"><FiPlus size={16} />Add Class</button>
      </div>

      {loading ? <div className="card"><PageLoader /></div> : sorted.length === 0 ? (
        <div className="card"><Empty icon={FiBook} title="No classes" action={<button onClick={openAdd} className="btn-primary mx-auto">Add Class</button>} /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map(c => (
            <div key={c._id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <span className="text-primary-800 font-bold text-sm">{c.name}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{c.name}</h3>
                    {c.classTeacher && <p className="text-xs text-gray-500">CT: {c.classTeacher.fullName}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-700 hover:bg-primary-50"><FiEdit2 size={14} /></button>
                  <button onClick={() => setDeleteId(c._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"><FiTrash2 size={14} /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3 text-center">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-lg font-bold text-gray-900">{c.studentCount ?? 0}</p>
                  <p className="text-xs text-gray-500">Students</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-lg font-bold text-gray-900">{c.subjects?.length ?? 0}</p>
                  <p className="text-xs text-gray-500">Subjects</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {c.subjects?.slice(0, 4).map(s => <Badge key={s._id} color="blue">{s.code}</Badge>)}
                {(c.subjects?.length || 0) > 4 && <Badge color="gray">+{c.subjects.length - 4}</Badge>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Class' : 'Add Class'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="form-label">Class Name *</label>
            <select className="form-input" {...register('name', { required: 'Required' })}>
              <option value="">Select</option>
              {['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'].map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Session</label>
              <input className="form-input" placeholder="2024/2025" {...register('session')} />
            </div>
            <div>
              <label className="form-label">Term</label>
              <select className="form-input" {...register('term')}>
                {['First Term', 'Second Term', 'Third Term'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="form-label">Class Teacher</label>
            <select className="form-input" {...register('classTeacher')}>
              <option value="">None</option>
              {teachers.map(t => <option key={t._id} value={t._id}>{t.fullName}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Assign Subjects</label>
            <select multiple className="form-input h-32" {...register('subjects')}>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            <p className="text-xs text-gray-400 mt-1">Hold Ctrl/Cmd to multi-select</p>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <Confirm open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} title="Delete Class" message="Classes with enrolled students cannot be deleted." />
    </div>
  );
}
