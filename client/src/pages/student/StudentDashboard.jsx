import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBarChart2, FiCheckSquare, FiBell, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { studentService, announcementService, attendanceService } from '../../services/api';
import { StatCard, Badge, PageLoader } from '../../components/common/UI';

const TC = { General: 'blue', Academic: 'green', Event: 'yellow', Urgent: 'red', Holiday: 'purple' };

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      studentService.getMe(),
      announcementService.getAll({ audience: 'Students' }),
    ]).then(([pRes, aRes]) => {
      const student = pRes.data.student;
      setProfile(student);
      setAnnouncements(aRes.data.announcements?.slice(0, 5));
      if (student?._id) {
        attendanceService.getSummary(student._id)
          .then(r => setSummary(r.data.summary))
          .catch(() => {});
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full font-medium">Student Portal</span>
      </div>

      {/* Profile card */}
      {profile && (
        <div className="card p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-purple-700 font-black text-2xl">{profile.fullName?.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">{profile.fullName}</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
              <span>Adm. No: <strong className="text-gray-700">{profile.admissionNumber}</strong></span>
              <span>Class: <strong className="text-gray-700">{profile.class?.name}</strong></span>
              <span>Gender: <strong className="text-gray-700">{profile.gender}</strong></span>
            </div>
          </div>
          <Badge color={profile.status === 'Active' ? 'green' : 'red'}>{profile.status}</Badge>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="My Results" value="View" icon={FiBarChart2} color="blue"
          sub="Check scores & grades" onClick={() => navigate('/student/results')} />
        <StatCard title="Attendance Rate" value={summary ? `${summary.percentage}%` : '—'} icon={FiCheckSquare} color="green"
          sub={summary ? `${summary.present} of ${summary.total} days` : 'No records yet'}
          onClick={() => navigate('/student/attendance')} />
        <StatCard title="Announcements" value={announcements.length} icon={FiBell} color="yellow"
          sub="Latest school news" onClick={() => navigate('/student/announcements')} />
      </div>

      {/* Attendance summary */}
      {summary && (
        <div className="card p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Attendance Summary</h3>
          <div className="grid grid-cols-4 gap-3 text-center mb-3">
            {[['Total', summary.total, 'text-gray-700'], ['Present', summary.present, 'text-green-700'], ['Absent', summary.absent, 'text-red-700'], ['Late', summary.late, 'text-yellow-700']].map(([l, v, c]) => (
              <div key={l} className="bg-gray-50 rounded-lg p-3">
                <p className={`text-xl font-bold ${c}`}>{v}</p>
                <p className="text-xs text-gray-500">{l}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Attendance Rate</span>
            <span className="font-semibold">{summary.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className={`h-2 rounded-full transition-all ${Number(summary.percentage) >= 75 ? 'bg-green-500' : Number(summary.percentage) >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${summary.percentage}%` }} />
          </div>
          {Number(summary.percentage) < 75 && (
            <p className="text-xs text-red-500 mt-2">⚠ Your attendance is below the 75% minimum requirement.</p>
          )}
        </div>
      )}

      {/* Announcements */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Recent Announcements</h3>
          <button onClick={() => navigate('/student/announcements')} className="text-xs text-purple-700 hover:underline">View all</button>
        </div>
        {announcements.length > 0 ? (
          <div className="space-y-2">
            {announcements.map(a => (
              <div key={a._id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-900 truncate">{a.title}</p>
                    <Badge color={TC[a.type] || 'gray'}>{a.type}</Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(a.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-gray-400 text-center py-4">No announcements.</p>}
      </div>
    </div>
  );
}
