import React, { useState, useEffect } from 'react';
import { FiSave, FiBarChart2 } from 'react-icons/fi';
import { teacherService, studentService, resultService } from '../../services/api';
import { PageLoader, GradeBadge } from '../../components/common/UI';
import { useToast } from '../../context/ToastContext';

const TERMS = ['First Term', 'Second Term', 'Third Term'];

export default function TeacherResultsPage() {
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [scores, setScores] = useState([]);
  const [filters, setFilters] = useState({ classId: '', subjectId: '', session: '2024/2025', term: 'First Term' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => { teacherService.getMe().then(r => setProfile(r.data.teacher)); }, []);

  useEffect(() => {
    if (!filters.classId) return;
    setLoading(true);
    studentService.getAll({ classId: filters.classId, limit: 100 }).then(r => {
      setStudents(r.data.students);
      setScores(r.data.students.map(s => ({ studentId: s._id, name: s.fullName, admNo: s.admissionNumber, ca1: 0, ca2: 0, exam: 0 })));
    }).finally(() => setLoading(false));
  }, [filters.classId]);

  // Load existing results when subject/session/term change
  useEffect(() => {
    if (!filters.classId || !filters.subjectId || !filters.session || !filters.term || students.length === 0) return;
    resultService.getAll({ classId: filters.classId, subjectId: filters.subjectId, session: filters.session, term: filters.term })
      .then(r => {
        const existing = r.data.results;
        setScores(prev => prev.map(row => {
          const found = existing.find(res => String(res.student?._id) === String(row.studentId));
          return found ? { ...row, ca1: found.ca1, ca2: found.ca2, exam: found.exam } : row;
        }));
      });
  }, [filters.subjectId, filters.session, filters.term, students.length]);

  const updateScore = (i, field, val) => {
    const max = { ca1: 30, ca2: 30, exam: 100 };
    setScores(prev => {
      const copy = [...prev];
      copy[i] = { ...copy[i], [field]: Math.min(max[field], Math.max(0, Number(val) || 0)) };
      return copy;
    });
  };

  const handleSave = async () => {
    if (!filters.classId || !filters.subjectId) { toast('Select class and subject', 'warning'); return; }
    setSaving(true);
    try {
      await resultService.bulk({
        classId: filters.classId,
        subjectId: filters.subjectId,
        session: filters.session,
        term: filters.term,
        results: scores,
      });
      toast('Results saved successfully', 'success');
    } catch (err) { toast(err.response?.data?.message || 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const classes = profile?.assignedClasses || [];
  const subjects = profile?.assignedSubjects || [];
  const ready = filters.classId && filters.subjectId && filters.session && filters.term;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Upload Results</h1><p className="text-sm text-gray-500">Enter student scores for your subjects</p></div>
        {ready && scores.length > 0 && (
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            <FiSave size={16} />{saving ? 'Saving...' : 'Save Results'}
          </button>
        )}
      </div>

      <div className="card p-4 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="form-label text-xs">Class</label>
          <select className="form-input" value={filters.classId} onChange={e => setFilters(f => ({ ...f, classId: e.target.value }))}>
            <option value="">Select</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label text-xs">Subject</label>
          <select className="form-input" value={filters.subjectId} onChange={e => setFilters(f => ({ ...f, subjectId: e.target.value }))}>
            <option value="">Select</option>
            {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label text-xs">Session</label>
          <input className="form-input" value={filters.session} onChange={e => setFilters(f => ({ ...f, session: e.target.value }))} placeholder="2024/2025" />
        </div>
        <div>
          <label className="form-label text-xs">Term</label>
          <select className="form-input" value={filters.term} onChange={e => setFilters(f => ({ ...f, term: e.target.value }))}>
            {TERMS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        {!ready ? (
          <div className="text-center py-16 text-gray-400">
            <FiBarChart2 size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Select class, subject, session and term</p>
          </div>
        ) : loading ? <PageLoader /> : scores.length === 0 ? (
          <div className="text-center py-16 text-gray-400"><p className="text-sm">No students in selected class.</p></div>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">{scores.length} students</p>
              <p className="text-xs text-gray-400">CA1 /30 · CA2 /30 · Exam /100 — Total normalised to /100</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr>
                  <th className="table-th">#</th>
                  <th className="table-th">Student</th>
                  <th className="table-th text-center">CA1 (/30)</th>
                  <th className="table-th text-center">CA2 (/30)</th>
                  <th className="table-th text-center">Exam (/100)</th>
                  <th className="table-th text-center">Total</th>
                  <th className="table-th text-center">Grade</th>
                </tr></thead>
                <tbody>
                  {scores.map((row, i) => {
                    const ca = Math.min((row.ca1 || 0) + (row.ca2 || 0), 40);
                    const exam = Math.min(row.exam || 0, 60);
                    const total = ca + exam;
                    const grade = total >= 70 ? 'A' : total >= 60 ? 'B' : total >= 50 ? 'C' : total >= 45 ? 'D' : total >= 40 ? 'E' : 'F';
                    return (
                      <tr key={row.studentId} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="table-td text-gray-400 text-xs">{i + 1}</td>
                        <td className="table-td">
                          <p className="font-medium text-gray-900">{row.name}</p>
                          <p className="text-xs text-gray-400">{row.admNo}</p>
                        </td>
                        {[['ca1', 30], ['ca2', 30], ['exam', 100]].map(([field, max]) => (
                          <td key={field} className="px-2 py-2 text-center">
                            <input type="number" min="0" max={max} value={row[field]}
                              onChange={e => updateScore(i, field, e.target.value)}
                              className="w-16 text-center border border-gray-300 rounded-lg px-1.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                          </td>
                        ))}
                        <td className="table-td text-center font-bold text-gray-900">{total}</td>
                        <td className="table-td text-center"><GradeBadge grade={grade} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 flex justify-end">
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                <FiSave size={15} />{saving ? 'Saving...' : 'Save All Results'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
