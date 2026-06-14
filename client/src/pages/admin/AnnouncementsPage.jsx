import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { FiPlus, FiEdit2, FiTrash2, FiBell } from 'react-icons/fi';
import { announcementService } from '../../services/api';
import { Modal, Confirm, PageLoader, Empty, Badge } from '../../components/common/UI';
import { useToast } from '../../context/ToastContext';

const TC = { General: 'blue', Academic: 'green', Event: 'yellow', Urgent: 'red', Holiday: 'purple' };
const AC = { All: 'gray', Students: 'blue', Teachers: 'green' };

export default function AnnouncementsPage({ readOnly = false }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset } = useForm();

  const fetch = useCallback(async () => {
    setLoading(true);
    try { const { data } = await announcementService.getAll(); setItems(data.announcements); }
    catch { toast('Failed', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openAdd = () => { setEditing(null); reset({ type: 'General', audience: 'All', isPublished: true }); setModalOpen(true); };
  const openEdit = (a) => { setEditing(a); reset({ title: a.title, content: a.content, type: a.type, audience: a.audience, isPublished: a.isPublished }); setModalOpen(true); };

  const onSubmit = async (d) => {
    setSaving(true);
    try {
      if (editing) { await announcementService.update(editing._id, d); toast('Updated', 'success'); }
      else { await announcementService.create(d); toast('Created', 'success'); }
      setModalOpen(false); fetch();
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await announcementService.delete(deleteId); toast('Deleted', 'success'); setDeleteId(null); fetch(); }
    catch { toast('Failed', 'error'); }
    finally { setDeleting(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Announcements</h1><p className="text-sm text-gray-500">{items.length} active</p></div>
        {!readOnly && <button onClick={openAdd} className="btn-primary"><FiPlus size={16} />New Announcement</button>}
      </div>

      {loading ? <PageLoader /> : items.length === 0 ? (
        <div className="card"><Empty icon={FiBell} title="No announcements" action={!readOnly && <button onClick={openAdd} className="btn-primary mx-auto">Create</button>} /></div>
      ) : (
        <div className="space-y-3">
          {items.map(a => (
            <div key={a._id} onClick={() => setViewing(a)} className="card p-5 cursor-pointer hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiBell size={15} className="text-blue-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-gray-900 text-sm truncate">{a.title}</p>
                      <Badge color={TC[a.type] || 'gray'}>{a.type}</Badge>
                      <Badge color={AC[a.audience] || 'gray'}>{a.audience}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{a.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(a.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {a.createdBy && ` · ${a.createdBy.name}`}
                    </p>
                  </div>
                </div>
                {!readOnly && (
                  <div className="flex gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-700 hover:bg-primary-50"><FiEdit2 size={14} /></button>
                    <button onClick={() => setDeleteId(a._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"><FiTrash2 size={14} /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.title} size="md">
        {viewing && (
          <div>
            <div className="flex gap-2 mb-4"><Badge color={TC[viewing.type]}>{viewing.type}</Badge><Badge color={AC[viewing.audience]}>{viewing.audience}</Badge></div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{viewing.content}</p>
            <p className="text-xs text-gray-400 mt-4 pt-4 border-t">
              {new Date(viewing.createdAt).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              {viewing.createdBy && ` · ${viewing.createdBy.name}`}
            </p>
          </div>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      {!readOnly && (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Announcement' : 'New Announcement'} size="md">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="form-label">Title *</label>
              <input className="form-input" {...register('title', { required: true })} />
            </div>
            <div>
              <label className="form-label">Content *</label>
              <textarea className="form-input" rows={5} {...register('content', { required: true })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Type</label>
                <select className="form-input" {...register('type')}>
                  {['General', 'Academic', 'Event', 'Urgent', 'Holiday'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Audience</label>
                <select className="form-input" {...register('audience')}>
                  {['All', 'Students', 'Teachers'].map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input type="checkbox" {...register('isPublished')} defaultChecked /> Publish immediately
            </label>
            <div className="flex justify-end gap-3 pt-2 border-t">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Publish'}</button>
            </div>
          </form>
        </Modal>
      )}

      <Confirm open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} title="Delete Announcement" />
    </div>
  );
}
