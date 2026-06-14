import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

/* ─── Spinner ─────────────────────────────────────────── */
export function Spinner({ size = 'md', className = '' }) {
  const s = { sm: 'w-4 h-4 border-2', md: 'w-7 h-7 border-2', lg: 'w-12 h-12 border-4' };
  return <div className={`${s[size]} border-primary-600 border-t-transparent rounded-full animate-spin ${className}`} />;
}

export function PageLoader() {
  return <div className="flex items-center justify-center py-24"><Spinner size="lg" /></div>;
}

/* ─── Modal ────────────────────────────────────────────── */
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"><FiX size={18} /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/* ─── Confirm Dialog ───────────────────────────────────── */
export function Confirm({ open, onClose, onConfirm, title, message, loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <FiAlertTriangle className="text-red-600" size={20} />
          </div>
          <div><h3 className="font-semibold text-gray-900">{title || 'Confirm'}</h3><p className="text-sm text-gray-500 mt-0.5">{message || 'This cannot be undone.'}</p></div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
          <button onClick={onConfirm} className="btn-danger" disabled={loading}>{loading ? 'Deleting...' : 'Delete'}</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Badge ─────────────────────────────────────────────── */
const BADGE_COLORS = {
  green: 'bg-green-100 text-green-800', red: 'bg-red-100 text-red-800',
  blue: 'bg-blue-100 text-blue-800', yellow: 'bg-yellow-100 text-yellow-800',
  purple: 'bg-purple-100 text-purple-800', gray: 'bg-gray-100 text-gray-700',
  orange: 'bg-orange-100 text-orange-800',
};
export function Badge({ children, color = 'gray' }) {
  return <span className={`badge ${BADGE_COLORS[color] || BADGE_COLORS.gray}`}>{children}</span>;
}

export function GradeBadge({ grade }) {
  const map = { A: 'green', B: 'blue', C: 'yellow', D: 'orange', E: 'purple', F: 'red' };
  return <Badge color={map[grade] || 'gray'}>{grade}</Badge>;
}

export function StatusBadge({ status }) {
  const map = { Active: 'green', Inactive: 'red', Graduated: 'blue', Transferred: 'yellow', 'On Leave': 'yellow', Resigned: 'red', Present: 'green', Absent: 'red', Late: 'yellow' };
  return <Badge color={map[status] || 'gray'}>{status}</Badge>;
}

/* ─── Pagination ────────────────────────────────────────── */
export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center gap-1 justify-center py-3">
      <button onClick={() => onChange(page - 1)} disabled={page === 1} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40">Prev</button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <button key={p} onClick={() => onChange(p)}
          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${p === page ? 'bg-primary-700 text-white border-primary-700' : 'border-gray-300 hover:bg-gray-50'}`}>{p}</button>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page === pages} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40">Next</button>
    </div>
  );
}

/* ─── Empty State ───────────────────────────────────────── */
export function Empty({ icon: Icon, title, message, action }) {
  return (
    <div className="text-center py-16">
      {Icon && <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3"><Icon size={24} className="text-gray-400" /></div>}
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      {message && <p className="text-xs text-gray-500 mt-1 mb-4">{message}</p>}
      {action}
    </div>
  );
}

/* ─── Stat Card ─────────────────────────────────────────── */
export function StatCard({ title, value, icon: Icon, color = 'blue', sub, onClick }) {
  const colors = { blue: 'bg-blue-50 text-blue-700', green: 'bg-green-50 text-green-700', yellow: 'bg-yellow-50 text-yellow-700', purple: 'bg-purple-50 text-purple-700', red: 'bg-red-50 text-red-700', orange: 'bg-orange-50 text-orange-700' };
  return (
    <div className={`stat-card ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`} onClick={onClick}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}><Icon size={22} /></div>
      <div><p className="text-sm text-gray-500 font-medium">{title}</p><p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>{sub && <p className="text-xs text-gray-400">{sub}</p>}</div>
    </div>
  );
}

/* ─── Search ────────────────────────────────────────────── */
export function SearchBar({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="form-input pl-9" />
    </div>
  );
}

/* ─── Input / Select helpers ────────────────────────────── */
export function Field({ label, error, required, children }) {
  return (
    <div>
      {label && <label className="form-label">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
      {children}
      {error && <p className="form-error">{error.message || error}</p>}
    </div>
  );
}
