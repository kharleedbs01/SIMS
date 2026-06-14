import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiUser, FiBook, FiBookOpen, FiCheckSquare, FiBell, FiTrendingUp, FiUserCheck } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { dashboardService, announcementService } from '../../services/api';
import { StatCard, Badge, PageLoader } from '../../components/common/UI';
import { useToast } from '../../context/ToastContext';

const COLORS = ['#1d4ed8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const TYPE_COLOR = { General: 'blue', Academic: 'green', Event: 'yellow', Urgent: 'red', Holiday: 'purple' };

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    dashboardService.stats()
      .then(r => setStats(r.data.stats))
      .catch(() => toast('Failed to load dashboard', 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const genderData = stats?.genderBreakdown?.map(g => ({ name: g._id || 'Unknown', value: g.count })) || [];
  const classData = stats?.studentsPerClass || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Students" value={stats?.totalStudents} icon={FiUsers} color="blue"
          sub={`${stats?.activeStudents} active`} onClick={() => navigate('/admin/students')} />
        <StatCard title="Total Teachers" value={stats?.totalTeachers} icon={FiUser} color="green"
          onClick={() => navigate('/admin/teachers')} />
        <StatCard title="Classes" value={stats?.totalClasses} icon={FiBook} color="yellow"
          onClick={() => navigate('/admin/classes')} />
        <StatCard title="Subjects" value={stats?.totalSubjects} icon={FiBookOpen} color="purple"
          onClick={() => navigate('/admin/subjects')} />
      </div>

      {/* Attendance row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Attendance Rate" value={`${stats?.attendanceRate ?? 0}%`} icon={FiCheckSquare} color="green" sub="Today" />
        <StatCard title="Present Today" value={stats?.presentToday ?? 0} icon={FiUserCheck} color="blue" />
        <StatCard title="Absent Today" value={stats?.absentToday ?? 0} icon={FiUsers} color="red" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Students Per Class</h3>
          {classData.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={classData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" fill="#1d4ed8" radius={[4, 4, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-12">No data yet</p>}
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Gender Distribution</h3>
          {genderData.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {genderData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-12">No data yet</p>}
        </div>
      </div>

      {/* Recent Announcements */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Recent Announcements</h3>
          <button onClick={() => navigate('/admin/announcements')} className="text-xs text-primary-700 hover:underline">View all</button>
        </div>
        {stats?.recentAnnouncements?.length > 0 ? (
          <div className="space-y-2">
            {stats.recentAnnouncements.map(a => (
              <div key={a._id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <FiBell size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-900 truncate">{a.title}</p>
                    <Badge color={TYPE_COLOR[a.type] || 'gray'}>{a.type}</Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(a.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-gray-400 text-center py-6">No announcements yet</p>}
      </div>
    </div>
  );
}
