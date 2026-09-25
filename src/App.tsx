import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import {
  getCurrentUser,
  setCurrentUser,
  getNotifications,
  markAllNotificationsAsRead,
  initializeStorage,
  getDarkMode,
  setDarkMode,
} from './services/storage';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AuthModal } from './components/auth/AuthModal';
import { NotificationModal } from './components/NotificationModal';
import { ToastContainer, ToastItem } from './components/common/Toast';

// Siswa SMA/SMK views (POV Baru!)
import { SiswaDashboard } from './components/siswa/SiswaDashboard';
import { SiswaLogbook } from './components/siswa/SiswaLogbook';
import { SiswaProfileView } from './components/siswa/SiswaProfileView';

// Student views (Mahasiswa)
import { JobsExplorer } from './components/student/JobsExplorer';
import { StudentDashboard } from './components/student/StudentDashboard';
import { MyApplications } from './components/student/MyApplications';
import { SavedJobs } from './components/student/SavedJobs';
import { StudentProfileView } from './components/student/StudentProfileView';

// Company views
import { CompanyDashboard } from './components/company/CompanyDashboard';
import { CompanyJobs } from './components/company/CompanyJobs';
import { ApplicantsManager } from './components/company/ApplicantsManager';
import { CompanyProfileView } from './components/company/CompanyProfileView';

// Admin views
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CompanyVerification } from './components/admin/CompanyVerification';
import { JobModeration } from './components/admin/JobModeration';
import { UserManagement } from './components/admin/UserManagement';
import { ActivityLogs } from './components/admin/ActivityLogs';

import {
  X,
  ShieldCheck,
  Building2,
  GraduationCap,
  School,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function App() {
  const [currentUser, setUser] = useState<User | null>(() => getCurrentUser());
  const [currentView, setCurrentView] = useState<string>(() => {
    const user = getCurrentUser();
    if (user?.role === 'siswa_sma') return 'siswa-dashboard';
    if (user?.role === 'perusahaan') return 'company-dashboard';
    if (user?.role === 'admin') return 'admin-dashboard';
    return 'jobs';
  });
  const [filterJobIdForApplicants, setFilterJobIdForApplicants] = useState<string | null>(null);

  // Modals & UI States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [authInitialRole, setAuthInitialRole] = useState<UserRole>('siswa_sma');
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    return getDarkMode();
  });

  // Initialize storage and dark mode on first mount
  useEffect(() => {
    initializeStorage();
    const isDark = getDarkMode();
    setDarkModeState(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }

    const handleDataChange = () => {
      setUser(getCurrentUser());
      refreshNotificationCount();
    };

    window.addEventListener('internspace_data_changed', handleDataChange);
    return () => {
      window.removeEventListener('internspace_data_changed', handleDataChange);
    };
  }, []);

  const handleToggleDarkMode = () => {
    const next = !darkMode;
    setDarkModeState(next);
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    addToast(next ? 'Mode Gelap diaktifkan' : 'Mode Terang diaktifkan', 'info');
  };

  // Toast notifications
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync unread notification count
  const refreshNotificationCount = () => {
    const current = getCurrentUser();
    if (!current) {
      setUnreadNotificationCount(0);
      return;
    }
    const notifs = getNotifications(current.id) || [];
    const unread = notifs.filter((n) => !n.isRead).length;
    setUnreadNotificationCount(unread);
  };

  useEffect(() => {
    refreshNotificationCount();
  }, [currentUser]);

  // When user role changes or currentUser changes, adapt current view
  const handleUserChange = (newUser: User | null) => {
    setUser(newUser);
    if (!newUser) {
      setCurrentView('jobs');
    } else if (newUser.role === 'siswa_sma') {
      setCurrentView('siswa-dashboard');
    } else if (newUser.role === 'mahasiswa') {
      setCurrentView('jobs');
    } else if (newUser.role === 'perusahaan') {
      setCurrentView('company-dashboard');
    } else if (newUser.role === 'admin') {
      setCurrentView('admin-dashboard');
    }
    refreshNotificationCount();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    handleUserChange(null);
    addToast('Anda telah berhasil keluar (logout).', 'info');
  };

  const handleOpenAuth = (mode: 'login' | 'register', role?: UserRole) => {
    setAuthInitialMode(mode);
    if (role) {
      setAuthInitialRole(role);
    }
    setIsAuthModalOpen(true);
  };

  const handleViewApplicantsForJob = (jobId: string) => {
    setFilterJobIdForApplicants(jobId);
    setCurrentView('company-applicants');
  };

  return (
    <div
      className={`min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 ${
        darkMode ? 'dark' : ''
      }`}
    >
      {/* Toast notifications container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Global Top Navbar */}
      <Navbar
        currentUser={currentUser}
        unreadNotificationCount={unreadNotificationCount}
        notifications={currentUser ? getNotifications(currentUser.id) : []}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenAuth={(mode) => handleOpenAuth(mode)}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        onLogout={handleLogout}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
        onNavigate={(view) => setCurrentView(view)}
        currentView={currentView}
        onNotify={(msg) => addToast(msg, 'info')}
      />

      {/* Main Body Layout with Sidebar + View */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        {/* Desktop and Mobile Sidebar */}
        {currentUser && (
          <Sidebar
            currentUser={currentUser}
            currentView={currentView}
            darkMode={darkMode}
            onToggleDarkMode={handleToggleDarkMode}
            onNavigate={(view) => {
              setCurrentView(view);
              setIsMobileMenuOpen(false);
            }}
          />
        )}

        {/* Mobile Slide-out Drawer */}
        {isMobileMenuOpen && currentUser && (
          <div className="fixed inset-0 z-40 md:hidden bg-slate-950/60 backdrop-blur-xs flex">
            <div className="w-4/5 max-w-xs bg-white dark:bg-slate-900 h-full p-4 overflow-y-auto shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="font-extrabold text-sm text-indigo-600">Navigasi Menu</div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <Sidebar
                  currentUser={currentUser}
                  currentView={currentView}
                  darkMode={darkMode}
                  onToggleDarkMode={handleToggleDarkMode}
                  onNavigate={(view) => {
                    setCurrentView(view);
                    setIsMobileMenuOpen(false);
                  }}
                  isMobileDrawer
                  onCloseMobileDrawer={() => setIsMobileMenuOpen(false)}
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                InternSpace Platform • PKL & Magang Terpadu
              </div>
            </div>
            <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {/* GUEST (NOT LOGGED IN) — "USER HARUS LOGIN DULU" */}
          {!currentUser && (
            <div className="space-y-6">
              {/* HERO GATEWAY WITH 3 ROLE OPTIONS */}
              <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-900 via-slate-900 to-slate-950 p-6 sm:p-10 text-white shadow-xl border border-indigo-800/40">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 mb-4">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Portal Magang & PKL Terpadu Indonesia
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
                    Selamat Datang di InternSpace
                  </h1>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
                    Silakan masuk terlebih dahulu untuk mengakses portal dan fitur sesuai peran Anda. Pilih peran akun Anda di bawah ini:
                  </p>

                  {/* 4 ROLE ENTRY CARDS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                    {/* Siswa SMA / SMK */}
                    <button
                      type="button"
                      id="guest-role-siswa"
                      onClick={() => handleOpenAuth('login', 'siswa_sma')}
                      className="p-4 rounded-2xl bg-slate-800/80 hover:bg-amber-950/40 border border-slate-700 hover:border-amber-500 text-left transition-all group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <School className="w-5 h-5" />
                      </div>
                      <div className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                        Siswa SMA / SMK
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                        Masuk untuk mencari tempat PKL, isi jurnal logbook, dan pantau pengesahan.
                      </div>
                      <div className="mt-3 text-xs font-bold text-amber-400 flex items-center gap-1">
                        <span>Masuk Portal Siswa</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </button>

                    {/* Mahasiswa */}
                    <button
                      type="button"
                      id="guest-role-mahasiswa"
                      onClick={() => handleOpenAuth('login', 'mahasiswa')}
                      className="p-4 rounded-2xl bg-slate-800/80 hover:bg-emerald-950/40 border border-slate-700 hover:border-emerald-500 text-left transition-all group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                        Mahasiswa
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                        Masuk untuk eksplorasi magang bergengsi, upload CV, dan lamar posisi.
                      </div>
                      <div className="mt-3 text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <span>Masuk Portal Mahasiswa</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </button>

                    {/* Perusahaan Mitra */}
                    <button
                      type="button"
                      id="guest-role-perusahaan"
                      onClick={() => handleOpenAuth('login', 'perusahaan')}
                      className="p-4 rounded-2xl bg-slate-800/80 hover:bg-sky-950/40 border border-slate-700 hover:border-sky-500 text-left transition-all group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="font-bold text-sm text-white group-hover:text-sky-300 transition-colors">
                        Perusahaan Mitra
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                        Masuk untuk publikasi lowongan magang & PKL serta kelola seleksi pelamar.
                      </div>
                      <div className="mt-3 text-xs font-bold text-sky-400 flex items-center gap-1">
                        <span>Masuk Portal Perusahaan</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </button>

                    {/* Admin Utama (Khusus Pemilik) */}
                    <button
                      type="button"
                      id="guest-role-admin"
                      onClick={() => handleOpenAuth('login', 'admin')}
                      className="p-4 rounded-2xl bg-slate-800/80 hover:bg-purple-950/40 border border-slate-700 hover:border-purple-500 text-left transition-all group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1.5 font-bold text-sm text-white group-hover:text-purple-300 transition-colors">
                        <span>Admin Utama</span>
                        <span className="text-[9px] bg-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded font-bold border border-purple-500/30">
                          Khusus
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                        Portal verifikasi perusahaan, moderasi lowongan, & pantau sistem (khusus akun Anda).
                      </div>
                      <div className="mt-3 text-xs font-bold text-purple-400 flex items-center gap-1">
                        <span>Masuk Portal Admin</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  </div>

                  {/* Footnote with Admin Portal */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
                    <span className="text-slate-400 text-[11px]">
                      Belum memiliki akun?{' '}
                      <button
                        onClick={() => handleOpenAuth('register')}
                        className="text-indigo-400 hover:underline font-semibold cursor-pointer"
                      >
                        Daftar Akun Baru
                      </button>
                    </span>

                    <button
                      type="button"
                      id="guest-admin-portal-link"
                      onClick={() => handleOpenAuth('login', 'admin')}
                      className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Akses Khusus Pemilik Sistem (Admin)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* PUBLIC PREVIEW OF JOBS EXPLORER */}
              <div className="mt-8">
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Katalog Lowongan Magang & PKL Terbuka
                    </h2>
                    <p className="text-xs text-slate-500">
                      Pratinjau katalog lowongan. Untuk melamar pekerjaan dan menyimpan ke favorit, silakan masuk ke akun Anda.
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenAuth('login')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    Masuk untuk Melamar
                  </button>
                </div>

                <JobsExplorer
                  currentUser={null}
                  onNotify={addToast}
                  onNavigateToAuth={() => handleOpenAuth('login')}
                />
              </div>
            </div>
          )}

          {/* SISWA SMA / SMK VIEWS (POV BARU!) */}
          {currentUser && currentUser.role === 'siswa_sma' && (
            <>
              {currentView === 'siswa-dashboard' && (
                <SiswaDashboard
                  currentUser={currentUser}
                  onNavigate={(view) => setCurrentView(view)}
                />
              )}
              {currentView === 'jobs' && (
                <JobsExplorer
                  currentUser={currentUser}
                  onNotify={addToast}
                  onNavigateToAuth={() => handleOpenAuth('login')}
                />
              )}
              {currentView === 'siswa-logbook' && (
                <SiswaLogbook
                  currentUser={currentUser}
                  onNotify={addToast}
                />
              )}
              {currentView === 'applications' && (
                <MyApplications
                  currentUser={currentUser}
                  onNotify={addToast}
                  onNavigateToJobs={() => setCurrentView('jobs')}
                />
              )}
              {currentView === 'saved-jobs' && (
                <SavedJobs
                  currentUser={currentUser}
                  onNotify={addToast}
                  onNavigateToJobs={() => setCurrentView('jobs')}
                />
              )}
              {currentView === 'profile' && (
                <SiswaProfileView currentUser={currentUser} onNotify={addToast} />
              )}
            </>
          )}

          {/* MAHASISWA VIEWS */}
          {currentUser && currentUser.role === 'mahasiswa' && (
            <>
              {currentView === 'jobs' && (
                <JobsExplorer
                  currentUser={currentUser}
                  onNotify={addToast}
                  onNavigateToAuth={() => handleOpenAuth('login')}
                />
              )}
              {currentView === 'student-dashboard' && (
                <StudentDashboard
                  currentUser={currentUser}
                  onNavigate={(view) => setCurrentView(view)}
                />
              )}
              {currentView === 'applications' && (
                <MyApplications
                  currentUser={currentUser}
                  onNotify={addToast}
                  onNavigateToJobs={() => setCurrentView('jobs')}
                />
              )}
              {currentView === 'saved-jobs' && (
                <SavedJobs
                  currentUser={currentUser}
                  onNotify={addToast}
                  onNavigateToJobs={() => setCurrentView('jobs')}
                />
              )}
              {currentView === 'profile' && (
                <StudentProfileView currentUser={currentUser} onNotify={addToast} />
              )}
            </>
          )}

          {/* COMPANY VIEWS */}
          {currentUser && currentUser.role === 'perusahaan' && (
            <>
              {currentView === 'company-dashboard' && (
                <CompanyDashboard
                  currentUser={currentUser}
                  onNavigate={(view) => setCurrentView(view)}
                />
              )}
              {currentView === 'company-jobs' && (
                <CompanyJobs
                  currentUser={currentUser}
                  onNotify={addToast}
                  onViewApplicants={handleViewApplicantsForJob}
                />
              )}
              {currentView === 'company-applicants' && (
                <ApplicantsManager
                  currentUser={currentUser}
                  onNotify={addToast}
                  filterJobId={filterJobIdForApplicants}
                />
              )}
              {currentView === 'company-profile' && (
                <CompanyProfileView currentUser={currentUser} onNotify={addToast} />
              )}
            </>
          )}

          {/* ADMIN VIEWS */}
          {currentUser && currentUser.role === 'admin' && (
            <>
              {currentView === 'admin-dashboard' && (
                <AdminDashboard
                  currentUser={currentUser}
                  onNavigate={(view) => setCurrentView(view)}
                />
              )}
              {currentView === 'verify-companies' && (
                <CompanyVerification onNotify={addToast} />
              )}
              {currentView === 'moderate-jobs' && (
                <JobModeration onNotify={addToast} />
              )}
              {currentView === 'user-management' && (
                <UserManagement onNotify={addToast} />
              )}
              {currentView === 'activity-logs' && (
                <ActivityLogs />
              )}
            </>
          )}
        </main>
      </div>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          initialMode={authInitialMode}
          initialRole={authInitialRole}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(message) => {
            addToast(message, 'success');
            const user = getCurrentUser();
            handleUserChange(user);
          }}
          onNotify={addToast}
        />
      )}

      {/* Notifications Modal */}
      {isNotificationModalOpen && currentUser && (
        <NotificationModal
          isOpen={isNotificationModalOpen}
          currentUser={currentUser}
          notifications={getNotifications(currentUser.id) || []}
          onNavigate={(view) => setCurrentView(view)}
          onClose={() => {
            setIsNotificationModalOpen(false);
            refreshNotificationCount();
          }}
          onMarkAllRead={() => {
            markAllNotificationsAsRead(currentUser.id);
            refreshNotificationCount();
            addToast('Semua notifikasi telah ditandai dibaca.', 'info');
          }}
        />
      )}
    </div>
  );
}
