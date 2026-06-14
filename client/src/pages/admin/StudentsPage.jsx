import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiEye } from 'react-icons/fi';
import { studentService, classService } from '../../services/api';
import { Modal, Confirm, PageLoader, Empty, Pagination, SearchBar, StatusBadge } from '../../components/common/UI';
import { useToast } from '../../context/ToastContext';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await studentService.getAll({ search, classId: filterClass, page, limit: 15 });
      setStudents(data.students);
      setPages(data.pages);
      setTotal(data.total);
    } catch { toast('Failed to load students', 'error'); }
    finally { setLoading(false); }
  }, [search, filterClass, page]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);
  useEffect(() => { classService.getAll().then(r => setClasses(r.data.classes)); }, []);

  const openAdd = () => { setEditing(null); reset({ status: 'Active' }); setModalOpen(true); };
  const openEdit = (s) => {
    setEditing(s);
    reset({
      fullName: s.fullName, gender: s.gender,
      dateOfBirth: s.dateOfBirth?.slice(0, 10),
      classId: s.class?._id, parentName: s.parentName,
      parentPhone: s.parentPhone, parentEmail: s.parentEmail,
      address: s.address, stateOfOrigin: s.stateOfOrigin,
      religion: s.religion, status: s.status,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editing) {
        await studentService.update(editing._id, data);
        toast('Student updated', 'success');
      } else {
        await studentService.create(data);
        toast('Student created successfully', 'success');
      }
      setModalOpen(false);
      fetchStudents();
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await studentService.delete(deleteId);
      toast('Student deleted', 'success');
      setDeleteId(null);
      fetchStudents();
    } catch (err) { toast(err.response?.data?.message || 'Delete failed', 'error'); }
    finally { setDeleting(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="text-sm text-gray-500">{total} students enrolled</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><FiPlus size={16} />Add Student</button>
      </div>

      <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search name or admission no..." className="flex-1" />
        <select value={filterClass} onChange={e => { setFilterClass(e.target.value); setPage(1); }} className="form-input w-full sm:w-40">
          <option value="">All Classes</option>
          {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? <PageLoader /> : students.length === 0 ? (
          <Empty icon={FiUsers} title="No students found" action={<button onClick={openAdd} className="btn-primary mx-auto">Add Student</button>} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr>
                  <th className="table-th">Student</th>
                  <th className="table-th hidden sm:table-cell">Adm. No.</th>
                  <th className="table-th">Class</th>
                  <th className="table-th hidden md:table-cell">Gender</th>
                  <th className="table-th hidden lg:table-cell">Parent</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-right">Actions</th>
                </tr></thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s._id} className="hover:bg-gray-50">
                      <td className="table-td">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-700 text-xs font-bold">{s.fullName?.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{s.fullName}</p>
                            <p className="text-xs text-gray-400 sm:hidden">{s.admissionNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-td hidden sm:table-cell font-mono text-xs text-gray-600">{s.admissionNumber}</td>
                      <td className="table-td font-medium">{s.class?.name || '—'}</td>
                      <td className="table-td hidden md:table-cell text-gray-600">{s.gender}</td>
                      <td className="table-td hidden lg:table-cell">
                        <p className="text-sm">{s.parentName}</p>
                        <p className="text-xs text-gray-400">{s.parentPhone}</p>
                      </td>
                      <td className="table-td"><StatusBadge status={s.status} /></td>
                      <td className="table-td text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => navigate(`/admin/results/report-card/${s._id}`)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50" title="Report Card"><FiEye size={14} /></button>
                          <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-700 hover:bg-primary-50"><FiEdit2 size={14} /></button>
                          <button onClick={() => setDeleteId(s._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"><FiTrash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-gray-100 px-4">
              <Pagination page={page} pages={pages} onChange={setPage} />
            </div>
          </>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Student' : 'Add New Student'} size="xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="form-label">Full Name *</label>
              <input className="form-input" {...register('fullName', { required: 'Full name required' })} />
              {errors.fullName && <p className="form-error">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="form-label">Gender *</label>
              <select className="form-input" {...register('gender', { required: 'Gender required' })}>
                <option value="">Select</option>
                <option>Male</option><option>Female</option>
              </select>
              {errors.gender && <p className="form-error">{errors.gender.message}</p>}
            </div>
            <div>
              <label className="form-label">Date of Birth *</label>
              <input type="date" className="form-input" {...register('dateOfBirth', { required: 'DOB required' })} />
              {errors.dateOfBirth && <p className="form-error">{errors.dateOfBirth.message}</p>}
            </div>
            <div>
              <label className="form-label">Class *</label>
              <select className="form-input" {...register('classId', { required: 'Class required' })}>
                <option value="">Select Class</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              {errors.classId && <p className="form-error">{errors.classId.message}</p>}
            </div>
            <div>
              <label className="form-label">Status</label>
              <select className="form-input" {...register('status')}>
                {['Active', 'Inactive', 'Graduated', 'Transferred'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Parent/Guardian Name *</label>
              <input className="form-input" {...register('parentName', { required: 'Parent name required' })} />
              {errors.parentName && <p className="form-error">{errors.parentName.message}</p>}
            </div>
            <div>
              <label className="form-label">Parent Phone *</label>
              <input className="form-input" {...register('parentPhone', { required: 'Phone required' })} />
              {errors.parentPhone && <p className="form-error">{errors.parentPhone.message}</p>}
            </div>
            <div>
              <label className="form-label">Parent Email</label>
              <input type="email" className="form-input" {...register('parentEmail')} />
            </div>
            <div>
              <label className="form-label">State of Origin</label>
              <input className="form-input" {...register('stateOfOrigin')} />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Address</label>
              <textarea className="form-input" rows={2} {...register('address')} />
            </div>
            {!editing && (
              <>
                <div className="sm:col-span-2 border-t pt-3">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Portal Login (optional)</p>
                </div>
                <div>
                  <label className="form-label">Login Email</label>
                  <input type="email" className="form-input" {...register('email')} placeholder="student@email.com" />
                </div>
                <div>
                  <label className="form-label">Password</label>
                  <input type="password" className="form-input" {...register('password')} placeholder="Default: AdmNo@sims" />
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Add Student'}</button>
          </div>
        </form>
      </Modal>

      <Confirm open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        loading={deleting} title="Delete Student" message="This will permanently delete the student and their login account." />
    </div>
  );
}
