import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import {
  getCurrentUser,
  setCurrentUser,
  getUsers,
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
  User as UserIcon,
  School,
  Sparkles,
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
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const handleDataChange = () => {
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
    } else {
      document.documentElement.classList.remove('dark');
    }
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
    if (!currentUser) {
      setUnreadNotificationCount(0);
      return;
    }
    const notifs = getNotifications(currentUser.id) || [];
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

  const handleRoleSwitch = (role: UserRole) => {
    const allUsers = getUsers();
    const target = allUsers.find((u) => u.role === role);
    if (target) {
      setCurrentUser(target);
      handleUserChange(target);
      const roleLabel =
        role === 'siswa_sma'
          ? 'SISWA SMA/SMK (PKL)'
          : role === 'mahasiswa'
          ? 'MAHASISWA'
          : role === 'perusahaan'
          ? 'MITRA PERUSAHAAN'
          : 'ADMIN';
      addToast(`Beralih peran ke: ${roleLabel} (${target.nama})`, 'info');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    handleUserChange(null);
    addToast('Anda telah berhasil keluar (logout).', 'info');
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleViewApplicantsForJob = (jobId: string) => {
    setFilterJobIdForApplicants(jobId);
    setCurrentView('company-applicants');
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Toast notifications container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Global Top Navbar */}
      <Navbar
        currentUser={currentUser}
        unreadNotificationCount={unreadNotificationCount}
        notifications={currentUser ? getNotifications(currentUser.id) : []}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenAuth={handleOpenAuth}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        onLogout={handleLogout}
        onRoleSwitch={handleRoleSwitch}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
        onNavigate={(view) => setCurrentView(view)}
        currentView={currentView}
        onNotify={(msg) => addToast(msg, 'info')}
      />

      {/* Quick Role Switch Bar for Easy Testing across all 4 Roles */}
      <div className="bg-slate-900 text-white px-4 py-2 text-xs border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 z-20 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="font-extrabold uppercase tracking-wider text-[10px] bg-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Uji POV Peran Cepat:
          </span>
          <span className="text-slate-300 hidden md:inline text-[11px]">
            Beralih instan antara Siswa SMA/SMK, Mahasiswa, Perusahaan, dan Admin:
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* 1. Siswa SMA / SMK */}
          <button
            onClick={() => handleRoleSwitch('siswa_sma')}
            id="role-switch-siswa"
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentUser?.role === 'siswa_sma'
                ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-400/40'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
            }`}
          >
            <School className="w-3.5 h-3.5" />
            <span>🎒 Siswa SMA / SMK</span>
          </button>

          {/* 2. Mahasiswa */}
          <button
            onClick={() => handleRoleSwitch('mahasiswa')}
            id="role-switch-mahasiswa"
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentUser?.role === 'mahasiswa'
                ? 'bg-emerald-400 text-slate-950 shadow-md ring-2 ring-emerald-400/40'
                : 'bg-slate-800 hover:bg-slate-700 text-emerald-300'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>🎓 Mahasiswa</span>
          </button>

          {/* 3. Mitra Perusahaan */}
          <button
            onClick={() => handleRoleSwitch('perusahaan')}
            id="role-switch-perusahaan"
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentUser?.role === 'perusahaan'
                ? 'bg-sky-400 text-slate-950 shadow-md ring-2 ring-sky-400/40'
                : 'bg-slate-800 hover:bg-slate-700 text-sky-300'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>🏢 Mitra Perusahaan</span>
          </button>

          {/* 4. Admin */}
          <button
            onClick={() => handleRoleSwitch('admin')}
            id="role-switch-admin"
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentUser?.role === 'admin'
                ? 'bg-purple-400 text-slate-950 shadow-md ring-2 ring-purple-400/40'
                : 'bg-slate-800 hover:bg-slate-700 text-purple-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>🛡️ Admin</span>
          </button>
        </div>
      </div>

      {/* Main Body Layout with Sidebar + View */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        {/* Desktop and Mobile Sidebar */}
        {currentUser && (
          <Sidebar
            currentUser={currentUser}
            currentView={currentView}
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
          {/* GUEST (NOT LOGGED IN) */}
          {!currentUser && (
            <>
              {currentView === 'jobs' && (
                <JobsExplorer
                  currentUser={null}
                  onNotify={addToast}
                  onNavigateToAuth={() => handleOpenAuth('login')}
                />
              )}
            </>
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

          {/* PERUSAHAAN VIEWS */}
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
                  onViewApplicantsForJob={handleViewApplicantsForJob}
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
              {currentView === 'admin-verify' && (
                <CompanyVerification currentUser={currentUser} onNotify={addToast} />
              )}
              {currentView === 'admin-jobs' && (
                <JobModeration currentUser={currentUser} onNotify={addToast} />
              )}
              {currentView === 'admin-users' && (
                <UserManagement currentUser={currentUser} onNotify={addToast} />
              )}
              {currentView === 'admin-logs' && (
                <ActivityLogs currentUser={currentUser} onNotify={addToast} />
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
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(user) => {
            const roleLabel =
              typeof user === 'string'
                ? user
                : user?.nama
                ? `Selamat datang, ${user.nama}!`
                : 'Berhasil masuk!';
            addToast(roleLabel, 'success');
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
