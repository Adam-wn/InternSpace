import React from 'react';
import { User } from '../types';
import {
  Compass,
  LayoutDashboard,
  FileText,
  Bookmark,
  User as UserIcon,
  Briefcase,
  Users,
  Building2,
  ShieldCheck,
  ClipboardCheck,
  Activity,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface SidebarProps {
  currentUser: User | null;
  currentView: string;
  onNavigate: (view: string) => void;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  currentView,
  onNavigate,
  isMobileDrawer = false,
  onCloseMobileDrawer,
}) => {
  if (!currentUser) return null;

  const role = currentUser.role;

  const handleNav = (view: string) => {
    onNavigate(view);
    if (onCloseMobileDrawer) onCloseMobileDrawer();
  };

  const navItemClass = (view: string) => {
    const isActive = currentView === view;
    return `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
      isActive
        ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/30'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
    }`;
  };

  return (
    <aside
      className={`${
        isMobileDrawer
          ? 'w-full'
          : 'w-64 shrink-0 hidden md:block border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xs min-h-[calc(100vh-4rem)] p-4'
      }`}
    >
      <div className="space-y-6">
        {/* Navigation Group based on Role */}
        {role === 'mahasiswa' && (
          <div>
            <div className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Menu Mahasiswa
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => handleNav('jobs')}
                id="nav-student-jobs"
                className={navItemClass('jobs')}
              >
                <Compass className="w-4 h-4 shrink-0" />
                <span>Cari Lowongan Magang</span>
              </button>

              <button
                onClick={() => handleNav('student-dashboard')}
                id="nav-student-dashboard"
                className={navItemClass('student-dashboard')}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Dashboard Saya</span>
              </button>

              <button
                onClick={() => handleNav('applications')}
                id="nav-student-applications"
                className={navItemClass('applications')}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span>Lamaran Saya</span>
              </button>

              <button
                onClick={() => handleNav('saved-jobs')}
                id="nav-student-saved-jobs"
                className={navItemClass('saved-jobs')}
              >
                <Bookmark className="w-4 h-4 shrink-0" />
                <span>Lowongan Disimpan</span>
              </button>

              <button
                onClick={() => handleNav('profile')}
                id="nav-student-profile"
                className={navItemClass('profile')}
              >
                <UserIcon className="w-4 h-4 shrink-0" />
                <span>Profil & CV Saya</span>
              </button>
            </nav>
          </div>
        )}

        {role === 'perusahaan' && (
          <div>
            <div className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Menu Mitra Perusahaan
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => handleNav('company-dashboard')}
                id="nav-company-dashboard"
                className={navItemClass('company-dashboard')}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Dashboard Ringkasan</span>
              </button>

              <button
                onClick={() => handleNav('company-jobs')}
                id="nav-company-jobs"
                className={navItemClass('company-jobs')}
              >
                <Briefcase className="w-4 h-4 shrink-0" />
                <span>Kelola Lowongan</span>
              </button>

              <button
                onClick={() => handleNav('company-applicants')}
                id="nav-company-applicants"
                className={navItemClass('company-applicants')}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>Daftar Pelamar</span>
              </button>

              <button
                onClick={() => handleNav('company-profile')}
                id="nav-company-profile"
                className={navItemClass('company-profile')}
              >
                <Building2 className="w-4 h-4 shrink-0" />
                <span>Profil Perusahaan</span>
              </button>
            </nav>
          </div>
        )}

        {role === 'admin' && (
          <div>
            <div className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Panel Kendali Admin
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => handleNav('admin-dashboard')}
                id="nav-admin-dashboard"
                className={navItemClass('admin-dashboard')}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Dashboard Statistik</span>
              </button>

              <button
                onClick={() => handleNav('admin-verify')}
                id="nav-admin-verify"
                className={navItemClass('admin-verify')}
              >
                <ClipboardCheck className="w-4 h-4 shrink-0" />
                <span>Verifikasi Perusahaan</span>
              </button>

              <button
                onClick={() => handleNav('admin-jobs')}
                id="nav-admin-jobs"
                className={navItemClass('admin-jobs')}
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Moderasi Lowongan</span>
              </button>

              <button
                onClick={() => handleNav('admin-users')}
                id="nav-admin-users"
                className={navItemClass('admin-users')}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>Manajemen Pengguna</span>
              </button>

              <button
                onClick={() => handleNav('admin-logs')}
                id="nav-admin-logs"
                className={navItemClass('admin-logs')}
              >
                <Activity className="w-4 h-4 shrink-0" />
                <span>Log Aktivitas Sistem</span>
              </button>
            </nav>
          </div>
        )}

        {/* Informational Banner */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
          <div className="text-[11px] font-bold text-indigo-900 dark:text-indigo-200 mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Sistem Terintegrasi
          </div>
          <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 leading-relaxed">
            Data tersimpan persisten. Anda dapat berpindah peran kapan saja untuk menguji alur lengkap.
          </p>
        </div>
      </div>
    </aside>
  );
};
