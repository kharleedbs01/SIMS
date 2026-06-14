import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckSquare, FiBarChart2, FiBell, FiBook, FiUsers } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { teacherService, announcementService } from '../../services/api';
import { StatCard, Badge, PageLoader } from '../../components/common/UI';

const TC = { General: 'blue', Academic: 'green', Event: 'yellow', Urgent: 'red', Holiday: 'purple' };

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      teacherService.getMe(),
      announcementService.getAll({ audience: 'Teachers' }),
    ]).then(([pRes, aRes]) => {
      setProfile(pRes.data.teacher);
      setAnnouncements(aRes.data.announcements?.slice(0, 5));
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
        <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full font-medium">Teacher Portal</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="My Classes" value={profile?.assignedClasses?.length || 0} icon={FiBook} color="blue"
          onClick={() => navigate('/teacher/attendance')} />
        <StatCard title="My Subjects" value={profile?.assignedSubjects?.length || 0} icon={FiBarChart2} color="green"
          onClick={() => navigate('/teacher/results')} />
        <StatCard title="Mark Attendance" value="Today" icon={FiCheckSquare} color="yellow"
          sub="Tap to mark" onClick={() => navigate('/teacher/attendance')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Subjects */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">My Subjects</h3>
          {profile?.assignedSubjects?.length > 0 ? (
            <div className="space-y-2">
              {profile.assignedSubjects.map(s => (
                <div key={s._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-700 text-xs font-bold">{s.code}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800">{s.name}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400 text-center py-8">No subjects assigned yet.</p>}
        </div>

        {/* Assigned Classes */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">My Classes</h3>
          {profile?.assignedClasses?.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {profile.assignedClasses.map(c => (
                <button key={c._id} onClick={() => navigate('/teacher/attendance')}
                  className="text-center p-3 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors">
                  <p className="font-bold text-blue-800 text-sm">{c.name}</p>
                </button>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400 text-center py-8">No classes assigned yet.</p>}
        </div>
      </div>

      {/* Announcements */}
      <div className="card p-5 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Announcements</h3>
          <button onClick={() => navigate('/teacher/announcements')} className="text-xs text-emerald-700 hover:underline">View all</button>
        </div>
        {announcements.length > 0 ? (
          <div className="space-y-2">
            {announcements.map(a => (
              <div key={a._id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <FiBell size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
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
