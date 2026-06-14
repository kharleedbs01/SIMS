import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPrinter } from 'react-icons/fi';
import { resultService } from '../../services/api';
import { PageLoader, GradeBadge } from '../../components/common/UI';
import { useToast } from '../../context/ToastContext';

const TERMS = ['First Term', 'Second Term', 'Third Term'];
const ord = n => n + (['th','st','nd','rd'][(n%100>10&&n%100<14)?0:(n%10<=3?n%10:0)]||'th');

export default function ReportCardPage() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState('2024/2025');
  const [term, setTerm] = useState('First Term');

  useEffect(() => {
    if (!session || !term) return;
    setLoading(true);
    resultService.reportCard(studentId, { session, term })
      .then(r => setData(r.data.reportCard))
      .catch(() => toast('Failed to load report card', 'error'))
      .finally(() => setLoading(false));
  }, [studentId, session, term]);

  return (
    <div>
      <div className="no-print mb-6 flex flex-wrap items-end gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary btn-sm"><FiArrowLeft size={14} />Back</button>
        <div>
          <label className="form-label text-xs">Session</label>
          <input className="form-input w-32" value={session} onChange={e => setSession(e.target.value)} placeholder="2024/2025" />
        </div>
        <div>
          <label className="form-label text-xs">Term</label>
          <select className="form-input w-40" value={term} onChange={e => setTerm(e.target.value)}>
            {TERMS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        {data && <button onClick={() => window.print()} className="btn-primary btn-sm"><FiPrinter size={14} />Print / PDF</button>}
      </div>

      {loading && <PageLoader />}

      {!loading && data && (
        <div id="report-card" className="bg-white max-w-3xl mx-auto p-8 shadow-md border border-gray-200 print:shadow-none print:border-0">
          {/* Header */}
          <div className="text-center pb-4 mb-5 border-b-4 border-primary-800">
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="w-16 h-16 bg-primary-800 rounded-full flex items-center justify-center">
                <span className="text-white font-black text-xl">PC</span>
              </div>
              <div>
                <h1 className="text-2xl font-black text-primary-900">PRIME COLLEGE</h1>
                <p className="text-sm font-bold text-primary-700">SECONDARY SCHOOL, GOMBE</p>
                <p className="text-xs text-gray-500">Tel: 08000000000 | info@primecollege.edu.ng</p>
              </div>
            </div>
            <div className="bg-primary-800 text-white py-1 px-6 rounded-full inline-block text-sm font-bold tracking-widest mt-1">STUDENT REPORT CARD</div>
          </div>

          {/* Info bar */}
          <div className="flex flex-wrap justify-between text-sm bg-gray-50 px-4 py-2 rounded-lg mb-5 gap-2">
            <span><strong>Session:</strong> {session}</span>
            <span><strong>Term:</strong> {term}</span>
            <span><strong>Date:</strong> {new Date().toLocaleDateString('en-NG')}</span>
          </div>

          {/* Student details */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mb-5 border border-gray-200 rounded-lg p-4">
            {[['Name', data.student?.fullName], ['Admission No.', data.student?.admissionNumber], ['Class', data.student?.class?.name], ['Gender', data.student?.gender], ['No. of Students', data.totalStudents], ['Class Position', data.position ? ord(data.position) : '—']].map(([k, v]) => (
              <div key={k} className="flex gap-2"><span className="text-gray-400 w-32">{k}:</span><span className="font-semibold text-gray-900">{v}</span></div>
            ))}
          </div>

          {/* Results table */}
          <table className="w-full text-sm mb-5 border-collapse">
            <thead>
              <tr className="bg-primary-800 text-white">
                {['Subject', 'CA1 /30', 'CA2 /30', 'Exam /100', 'Total /100', 'Grade', 'Remark'].map(h => (
                  <th key={h} className="py-2 px-3 text-left font-semibold text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.results.map((r, i) => (
                <tr key={r._id} className={i % 2 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2 px-3 font-medium border-b border-gray-100">{r.subject?.name}</td>
                  <td className="py-2 px-3 text-center border-b border-gray-100">{r.ca1}</td>
                  <td className="py-2 px-3 text-center border-b border-gray-100">{r.ca2}</td>
                  <td className="py-2 px-3 text-center border-b border-gray-100">{r.exam}</td>
                  <td className="py-2 px-3 text-center font-bold border-b border-gray-100">{r.total}</td>
                  <td className="py-2 px-3 text-center border-b border-gray-100 font-bold">{r.grade}</td>
                  <td className="py-2 px-3 text-center border-b border-gray-100 text-xs">{r.remark}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-primary-50 font-semibold">
                <td className="py-2 px-3 border-t-2 border-primary-200" colSpan={4}>SUMMARY</td>
                <td className="py-2 px-3 text-center border-t-2 border-primary-200 font-bold text-primary-900">{data.totalScore}</td>
                <td className="py-2 px-3 border-t-2 border-primary-200" colSpan={2}>
                  Average: <strong>{data.average}%</strong>
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Grade key */}
          <div className="bg-gray-50 rounded-lg p-3 mb-6 text-xs text-gray-600">
            <span className="font-bold">Grading: </span>
            {[['A','70-100','Excellent'],['B','60-69','Very Good'],['C','50-59','Good'],['D','45-49','Fair'],['E','40-44','Pass'],['F','0-39','Fail']].map(([g,r,rem]) => (
              <span key={g} className="mr-4"><strong>{g}</strong>({r})={rem}</span>
            ))}
          </div>

          {/* Performance boxes */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[['Total Score', data.totalScore, 'blue'], ['Average', `${data.average}%`, 'green'], ['Position', data.position ? ord(data.position) : '—', 'yellow']].map(([l, v, c]) => (
              <div key={l} className={`text-center rounded-xl p-3 border bg-${c}-50 border-${c}-100`}>
                <p className={`text-2xl font-black text-${c}-800`}>{v}</p>
                <p className={`text-xs text-${c}-600 font-medium`}>{l}</p>
              </div>
            ))}
          </div>

          {/* Teacher's comment */}
          <div className="mb-6 border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Class Teacher's Comment:</p>
            <div className="h-8 border-b border-dashed border-gray-300" />
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 mt-6">
            <div className="text-center">
              <div className="h-12 border-b-2 border-gray-400 mb-2" />
              <p className="text-sm font-semibold text-gray-700">Class Teacher</p>
              <p className="text-xs text-gray-400">Date: ___________</p>
            </div>
            <div className="text-center">
              <div className="h-12 border-b-2 border-gray-400 mb-2" />
              <p className="text-sm font-semibold text-gray-700">Principal</p>
              <p className="text-xs text-gray-400">Date: ___________</p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6 border-t pt-3">Computer-generated report — Prime College Secondary School, Gombe</p>
        </div>
      )}

      {!loading && !data && <div className="card text-center py-16 text-gray-400"><p className="text-sm">Select session and term to generate report card.</p></div>}

      <style>{`@media print{.no-print{display:none!important}body *{visibility:hidden}#report-card,#report-card *{visibility:visible}#report-card{position:absolute;left:0;top:0;width:100%;padding:16px}}`}</style>
    </div>
  );
}
