import React, { useState, useEffect } from 'react';
import { FiBarChart2 } from 'react-icons/fi';
import { resultService, studentService } from '../../services/api';
import { PageLoader, GradeBadge, Empty } from '../../components/common/UI';
import { useToast } from '../../context/ToastContext';

const TERMS = ['First Term', 'Second Term', 'Third Term'];

export default function StudentResultsPage() {
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState({ session: '2024/2025', term: 'First Term' });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    resultService.getMy(filters)
      .then(r => { setResults(r.data.results); setSummary(r.data.summary); })
      .catch(() => toast('Failed to load results', 'error'))
      .finally(() => setLoading(false));
  }, [filters.session, filters.term]);

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">My Results</h1><p className="text-sm text-gray-500">View your academic scores</p></div>
      </div>

      <div className="card p-4 mb-4 flex flex-wrap gap-3">
        <div>
          <label className="form-label text-xs">Session</label>
          <input className="form-input w-36" value={filters.session} onChange={e => setFilters(f => ({ ...f, session: e.target.value }))} placeholder="2024/2025" />
        </div>
        <div>
          <label className="form-label text-xs">Term</label>
          <select className="form-input w-44" value={filters.term} onChange={e => setFilters(f => ({ ...f, term: e.target.value }))}>
            {TERMS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {summary && results.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="card p-4 text-center"><p className="text-2xl font-bold text-blue-700">{summary.count}</p><p className="text-xs text-gray-500">Subjects</p></div>
          <div className="card p-4 text-center"><p className="text-2xl font-bold text-green-700">{summary.totalScore}</p><p className="text-xs text-gray-500">Total Score</p></div>
          <div className="card p-4 text-center"><p className="text-2xl font-bold text-purple-700">{summary.average}%</p><p className="text-xs text-gray-500">Average</p></div>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? <PageLoader /> : results.length === 0 ? (
          <Empty icon={FiBarChart2} title="No results yet" message="Results for this term have not been uploaded yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>
                <th className="table-th">Subject</th>
                <th className="table-th text-center">CA1 (/30)</th>
                <th className="table-th text-center">CA2 (/30)</th>
                <th className="table-th text-center">Exam (/100)</th>
                <th className="table-th text-center">Total (/100)</th>
                <th className="table-th text-center">Grade</th>
                <th className="table-th text-center">Remark</th>
                <th className="table-th text-center">Position</th>
              </tr></thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={r._id} className={`${i % 2 ? 'bg-gray-50' : ''} hover:bg-purple-50 transition-colors`}>
                    <td className="table-td font-medium text-gray-900">{r.subject?.name}</td>
                    <td className="table-td text-center text-sm">{r.ca1}</td>
                    <td className="table-td text-center text-sm">{r.ca2}</td>
                    <td className="table-td text-center text-sm">{r.exam}</td>
                    <td className="table-td text-center font-bold text-gray-900">{r.total}</td>
                    <td className="table-td text-center"><GradeBadge grade={r.grade} /></td>
                    <td className="table-td text-center text-xs text-gray-600">{r.remark}</td>
                    <td className="table-td text-center text-sm font-medium">
                      {r.position ? `${r.position}${[,'st','nd','rd'][r.position] || 'th'}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-semibold">
                  <td className="table-td">TOTAL / AVERAGE</td>
                  <td colSpan={3} className="table-td" />
                  <td className="table-td text-center font-bold">{summary?.totalScore}</td>
                  <td colSpan={3} className="table-td text-center text-sm text-gray-600">Avg: {summary?.average}%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="card p-4 mt-4">
          <p className="text-xs font-bold text-gray-500 mb-2">GRADING SCALE</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-600">
            {[['A','70-100','Excellent'],['B','60-69','Very Good'],['C','50-59','Good'],['D','45-49','Fair'],['E','40-44','Pass'],['F','0-39','Fail']].map(([g,r,rem]) => (
              <span key={g}><strong>{g}</strong> ({r}) = {rem}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
