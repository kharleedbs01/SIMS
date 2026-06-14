import React, { useState, useEffect } from 'react';
import { FiCheckSquare } from 'react-icons/fi';
import { attendanceService, studentService } from '../../services/api';
import { PageLoader, Badge } from '../../components/common/UI';
import { useToast } from '../../context/ToastContext';

const SC = { Present: 'green', Absent: 'red', Late: 'yellow' };

export default function StudentAttendancePage() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    attendanceService.getMy()
      .then(r => { setRecords(r.data.records); setSummary(r.data.summary); })
      .catch(() => toast('Failed to load attendance', 'error'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">My Attendance</h1><p className="text-sm text-gray-500">Track your daily attendance record</p></div>
      </div>

      {summary && (
        <div className="mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            {[['Total Days', summary.total, 'text-gray-700', 'bg-gray-50'], ['Present', summary.present, 'text-green-700', 'bg-green-50'], ['Absent', summary.absent, 'text-red-700', 'bg-red-50'], ['Late', summary.late, 'text-yellow-700', 'bg-yellow-50']].map(([l, v, c, bg]) => (
              <div key={l} className={`card p-4 text-center ${bg}`}>
                <p className={`text-2xl font-bold ${c}`}>{v}</p>
                <p className="text-xs text-gray-500 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
          <div className="card p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 font-medium">Overall Attendance Rate</span>
              <span className={`font-bold ${Number(summary.percentage) >= 75 ? 'text-green-700' : Number(summary.percentage) >= 50 ? 'text-yellow-700' : 'text-red-700'}`}>
                {summary.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className={`h-3 rounded-full transition-all ${Number(summary.percentage) >= 75 ? 'bg-green-500' : Number(summary.percentage) >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${summary.percentage}%` }} />
            </div>
            {Number(summary.percentage) < 75 && (
              <p className="text-xs text-red-500 mt-2">⚠ Your attendance is below the required 75% minimum.</p>
            )}
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700">Attendance Records</p>
        </div>
        {loading ? <PageLoader /> : records.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FiCheckSquare size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No attendance records found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {records.map((r, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${r.status === 'Present' ? 'bg-green-500' : r.status === 'Absent' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(r.date).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    {r.remark && <p className="text-xs text-gray-400">{r.remark}</p>}
                  </div>
                </div>
                <Badge color={SC[r.status]}>{r.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
