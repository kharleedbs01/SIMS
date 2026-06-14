import React, { useState, useEffect, useCallback } from 'react';
import { attendanceService, classService, studentService } from '../../services/api';
import { PageLoader, Empty, Badge } from '../../components/common/UI';
import { useToast } from '../../context/ToastContext';
import { FiCheckSquare } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SC = { Present: 'green', Absent: 'red', Late: 'yellow' };

export default function AdminAttendancePage() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [filters, setFilters] = useState({ classId: '', date: new Date().toISOString().slice(0, 10) });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => { classService.getAll().then(r => setClasses(r.data.classes)); }, []);

  useEffect(() => {
    if (!filters.classId || !filters.date) return;
    setLoading(true);
    attendanceService.getAll({ classId: filters.classId, date: filters.date })
      .then(r => {
        const att = r.data.attendance?.[0] || null;
        setAttendance(att);
      })
      .catch(() => toast('Failed', 'error'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    if (!filters.classId) return;
    const end = new Date(), start = new Date();
    start.setDate(start.getDate() - 6);
    attendanceService.getAll({ classId: filters.classId, startDate: start.toISOString(), endDate: end.toISOString() }).then(r => {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const ds = d.toISOString().slice(0, 10);
        const day = d.toLocaleDateString('en', { weekday: 'short' });
        const rec = r.data.attendance.find(a => a.date?.slice(0, 10) === ds);
        days.push({ day, present: rec ? rec.records.filter(r => r.status === 'Present' || r.status === 'Late').length : 0 });
      }
      setWeekly(days);
    });
  }, [filters.classId]);

  const records = attendance?.records || [];
  const present = records.filter(r => r.status === 'Present').length;
  const absent = records.filter(r => r.status === 'Absent').length;
  const late = records.filter(r => r.status === 'Late').length;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Attendance Records</h1><p className="text-sm text-gray-500">View class attendance by date</p></div>
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
          <input type="date" className="form-input w-44" value={filters.date} max={new Date().toISOString().slice(0, 10)}
            onChange={e => setFilters(f => ({ ...f, date: e.target.value }))} />
        </div>
      </div>

      {records.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[['Total', records.length, 'text-gray-700'], ['Present', present, 'text-green-700'], ['Absent', absent, 'text-red-700'], ['Late', late, 'text-yellow-700']].map(([l, v, c]) => (
            <div key={l} className="card p-4 text-center"><p className={`text-2xl font-bold ${c}`}>{v}</p><p className="text-xs text-gray-500">{l}</p></div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card overflow-hidden">
          {!filters.classId ? (
            <div className="text-center py-16 text-gray-400"><FiCheckSquare size={36} className="mx-auto mb-2 opacity-30" /><p className="text-sm">Select a class</p></div>
          ) : loading ? <PageLoader /> : !attendance ? (
            <Empty icon={FiCheckSquare} title="No attendance record" message={`No attendance marked for ${filters.date}`} />
          ) : (
            <>
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-700">{classes.find(c => c._id === filters.classId)?.name} — {new Date(filters.date).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </div>
              <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                {records.map((r, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-gray-600">{r.student?.fullName?.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{r.student?.fullName}</p>
                        <p className="text-xs text-gray-400">{r.student?.admissionNumber}</p>
                      </div>
                    </div>
                    <Badge color={SC[r.status]}>{r.status}</Badge>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">7-Day Trend</h3>
          {weekly.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weekly} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="present" fill="#10b981" radius={[3, 3, 0, 0]} name="Present" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-gray-400 text-center py-16">Select a class</p>}
        </div>
      </div>
    </div>
  );
}
