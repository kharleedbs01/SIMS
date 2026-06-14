import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AppLayout from './components/layout/AppLayout';
import { Spinner } from './components/common/UI';

// Auth
import LoginPage from './pages/auth/LoginPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentsPage from './pages/admin/StudentsPage';
import TeachersPage from './pages/admin/TeachersPage';
import ClassesPage from './pages/admin/ClassesPage';
import SubjectsPage from './pages/admin/SubjectsPage';
import AdminResultsPage from './pages/admin/AdminResultsPage';
import AdminAttendancePage from './pages/admin/AdminAttendancePage';
import AnnouncementsPage from './pages/admin/AnnouncementsPage';
import UsersPage from './pages/admin/UsersPage';
import ReportCardPage from './pages/admin/ReportCardPage';

// Teacher
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherAttendancePage from './pages/teacher/TeacherAttendancePage';
import TeacherResultsPage from './pages/teacher/TeacherResultsPage';
import TeacherAnnouncementsPage from './pages/teacher/TeacherAnnouncementsPage';

// Student
import StudentDashboard from './pages/student/StudentDashboard';
import StudentResultsPage from './pages/student/StudentResultsPage';
import StudentAttendancePage from './pages/student/StudentAttendancePage';
import StudentAnnouncementsPage from './pages/student/StudentAnnouncementsPage';

function Guard({ roles, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}`} replace />;
  return children;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Admin */}
            <Route path="/admin" element={<Guard roles={['admin']}><AppLayout /></Guard>}>
              <Route index element={<AdminDashboard />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="teachers" element={<TeachersPage />} />
              <Route path="classes" element={<ClassesPage />} />
              <Route path="subjects" element={<SubjectsPage />} />
              <Route path="results" element={<AdminResultsPage />} />
              <Route path="results/report-card/:studentId" element={<ReportCardPage />} />
              <Route path="attendance" element={<AdminAttendancePage />} />
              <Route path="announcements" element={<AnnouncementsPage />} />
              <Route path="users" element={<UsersPage />} />
            </Route>

            {/* Teacher */}
            <Route path="/teacher" element={<Guard roles={['teacher']}><AppLayout /></Guard>}>
              <Route index element={<TeacherDashboard />} />
              <Route path="attendance" element={<TeacherAttendancePage />} />
              <Route path="results" element={<TeacherResultsPage />} />
              <Route path="announcements" element={<TeacherAnnouncementsPage />} />
            </Route>

            {/* Student */}
            <Route path="/student" element={<Guard roles={['student']}><AppLayout /></Guard>}>
              <Route index element={<StudentDashboard />} />
              <Route path="results" element={<StudentResultsPage />} />
              <Route path="attendance" element={<StudentAttendancePage />} />
              <Route path="announcements" element={<StudentAnnouncementsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
