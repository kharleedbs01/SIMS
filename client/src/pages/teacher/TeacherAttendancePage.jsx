import React, { useState, useEffect } from 'react';
import { FiSave, FiCheckSquare } from 'react-icons/fi';
import { teacherService, studentService, attendanceService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageLoader, Badge } from '../../components/common/UI';
import { useToast } from '../../context/ToastContext';

const STATUS_OPTIONS = ['Present', 'Absent', 'Late'];
const STATUS_STYLES = {
  Present: 'bg-green-100 text-green-800 border-green-300 ring-green-400',
  Absent: 'bg-red-100 text-red-800 border-red-300 ring-red-400',
  Late: 'bg-yellow-100 text-yellow-800 border-yellow-300 ring-yellow-400',
};
const TERMS = ['First Term', 'Second Term', 'Third Term'];

export default function TeacherAttendancePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [filters, setFilters] = useState({ classId: '', date: new Date().toISOString().slice(0, 10), session: '2024/2025', term: 'First Term' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alreadyMarked, setAlreadyMarked] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    teacherService.getMe().then(r => {
      setProfile(r.data.teacher);
    });
  }, []);

  useEffect(() => {
    if (!filters.classId) return;
    setLoading(true);
    studentService.getAll({ classId: filters.classId, limit: 100 }).then(r => {
      const studs = r.data.students;
      setStudents(studs);
      const def = {};
      studs.forEach(s => { def[s._id] = 'Present'; });
      setAttendance(def);
      setAlreadyMarked(false);
    }).finally(() => setLoading(false));
  }, [filters.classId]);

  useEffect(() => {
    if (!filters.classId || !filters.date) return;
    attendanceService.getAll({ classId: filters.classId, date: filters.date }).then(r => {
      const rec = r.data.attendance?.[0];
      if (rec) {
        setAlreadyMarked(true);
        const map = {};
        rec.records.forEach(r => { map[String(r.student?._id || r.student)] = r.status; });
        setAttendance(prev => ({ ...prev, ...map }));
      } else {
        setAlreadyMarked(false);
      }
    });
  }, [filters.classId, filters.date]);

  const setStatus = (id, status) => setAttendance(prev => ({ ...prev, [id]: status }));
  const markAll = (status) => {
    const all = {};
    students.forEach(s => { all[s._id] = status; });
    setAttendance(all);
  };

  const handleSave = async () => {
    if (!filters.classId) { toast('Select a class first', 'warning'); return; }
    setSaving(true);
    try {
      const records = students.map(s => ({ student: s._id, status: attendance[s._id] || 'Present' }));
      await attendanceService.mark({ classId: filters.classId, date: filters.date, session: filters.session, term: filters.term, records });
      toast('Attendance saved successfully', 'success');
      setAlreadyMarked(true);
    } catch (err) { toast(err.response?.data?.message || 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const present = Object.values(attendance).filter(s => s === 'Present').length;
  const absent = Object.values(attendance).filter(s => s === 'Absent').length;
  const late = Object.values(attendance).filter(s => s === 'Late').length;
  const classes = profile?.assignedClasses || [];

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Mark Attendance</h1><p className="text-sm text-gray-500">Record daily student attendance</p></div>
      </div>

      <div className="card p-4 mb-4 flex flex-wrap gap-3">
        <div>
          <label className="form-label text-xs">Class</label>
          <select className="form-input w-36" value={filters.classId} onChange={e => setFilters(f => ({ ...f, classId: e.target.value }))}>
            <option value="">Select</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label text-xs">Date</label>
          <input type="date" className="form-input w-44" value={filters.date}
            max={new Date().toISOString().slice(0, 10)}
            onChange={e => setFilters(f => ({ ...f, date: e.target.value }))} />
        </div>
        <div>
          <label className="form-label text-xs">Term</label>
          <select className="form-input w-40" value={filters.term} onChange={e => setFilters(f => ({ ...f, term: e.target.value }))}>
            {TERMS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {filters.classId && students.length > 0 && (
        <>
          <div className="card p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-4 text-sm">
              <span className="text-green-700 font-semibold">✓ {present} Present</span>
              <span className="text-red-700 font-semibold">✗ {absent} Absent</span>
              <span className="text-yellow-700 font-semibold">~ {late} Late</span>
              {alreadyMarked && <Badge color="green">Already Marked</Badge>}
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => markAll('Present')} className="btn-secondary btn-sm text-green-700">All Present</button>
              <button onClick={() => markAll('Absent')} className="btn-secondary btn-sm text-red-700">All Absent</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary btn-sm">
                <FiSave size={13} />{saving ? 'Saving...' : alreadyMarked ? 'Update' : 'Save'}
              </button>
            </div>
          </div>

          <div className="card overflow-hidden">
            {loading ? <PageLoader /> : (
              <div className="divide-y divide-gray-50">
                {students.map((s, i) => (
                  <div key={s._id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-6 text-right">{i + 1}</span>
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-700 text-xs font-bold">{s.fullName?.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{s.fullName}</p>
                        <p className="text-xs text-gray-400">{s.admissionNumber}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      {STATUS_OPTIONS.map(status => (
                        <button key={status} onClick={() => setStatus(s._id, status)}
                          className={`px-3 py-1 text-xs rounded-lg border font-medium transition-all
                            ${attendance[s._id] === status
                              ? `${STATUS_STYLES[status]} ring-2`
                              : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}>
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {!filters.classId && (
        <div className="card text-center py-16 text-gray-400">
          <FiCheckSquare size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Select a class to start marking attendance</p>
        </div>
      )}

      {filters.classId && !loading && students.length === 0 && (
        <div className="card text-center py-16 text-gray-400">
          <p className="text-sm">No students found in this class.</p>
        </div>
      )}
    </div>
  );
}
