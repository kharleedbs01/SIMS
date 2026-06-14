import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiGrid, FiUsers, FiUser, FiBook, FiBookOpen, FiBarChart2,
  FiCheckSquare, FiBell, FiLogOut, FiMenu, FiX, FiSettings,
  FiShield,
} from 'react-icons/fi';

const adminNav = [
  { to: '/admin', icon: FiGrid, label: 'Dashboard', end: true },
  { to: '/admin/students', icon: FiUsers, label: 'Students' },
  { to: '/admin/teachers', icon: FiUser, label: 'Teachers' },
  { to: '/admin/classes', icon: FiBook, label: 'Classes' },
  { to: '/admin/subjects', icon: FiBookOpen, label: 'Subjects' },
  { to: '/admin/results', icon: FiBarChart2, label: 'Results' },
  { to: '/admin/attendance', icon: FiCheckSquare, label: 'Attendance' },
  { to: '/admin/announcements', icon: FiBell, label: 'Announcements' },
  { to: '/admin/users', icon: FiShield, label: 'User Accounts' },
];

const teacherNav = [
  { to: '/teacher', icon: FiGrid, label: 'Dashboard', end: true },
  { to: '/teacher/attendance', icon: FiCheckSquare, label: 'Attendance' },
  { to: '/teacher/results', icon: FiBarChart2, label: 'Results' },
  { to: '/teacher/announcements', icon: FiBell, label: 'Announcements' },
];

const studentNav = [
  { to: '/student', icon: FiGrid, label: 'Dashboard', end: true },
  { to: '/student/results', icon: FiBarChart2, label: 'My Results' },
  { to: '/student/attendance', icon: FiCheckSquare, label: 'My Attendance' },
  { to: '/student/announcements', icon: FiBell, label: 'Announcements' },
];

const bgColors = { admin: 'bg-primary-900', teacher: 'bg-emerald-900', student: 'bg-purple-900' };
const accentColors = { admin: 'bg-primary-700', teacher: 'bg-emerald-700', student: 'bg-purple-700' };

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const navItems = user?.role === 'admin' ? adminNav : user?.role === 'teacher' ? teacherNav : studentNav;
  const bg = bgColors[user?.role] || bgColors.admin;
  const accent = accentColors[user?.role] || accentColors.admin;

  const handleLogout = () => { logout(); navigate('/login'); };

  const Sidebar = () => (
    <div className={`flex flex-col h-full ${bg}`}>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <FiBook className="text-white" size={20} />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Prime College</p>
            <p className="text-white/60 text-xs">Secondary School, Gombe</p>
          </div>
        </div>
      </div>
      {/* User info */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 ${accent} rounded-full flex items-center justify-center flex-shrink-0`}>
            <span className="text-white text-xs font-bold">{user?.name?.charAt(0)}</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-white/50 text-xs capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <Icon size={17} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button onClick={handleLogout} className="sidebar-item w-full text-red-300 hover:bg-red-500/20 hover:text-red-200">
          <FiLogOut size={17} /><span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 flex-col flex-shrink-0"><Sidebar /></aside>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-60 flex flex-col z-10"><Sidebar /></aside>
        </div>
      )}
      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setOpen(true)} className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"><FiMenu size={20} /></button>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-gray-800">Prime College Secondary School, Gombe</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <div className={`w-8 h-8 ${accent} rounded-full flex items-center justify-center`}>
              <span className="text-white text-xs font-bold">{user?.name?.charAt(0)}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6"><Outlet /></main>
      </div>
    </div>
  );
}
