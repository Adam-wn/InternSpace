import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import {
  getCurrentUser,
  setCurrentUser,
  getUsers,
  getNotifications,
  markAllNotificationsAsRead,
  getJobs,
  initializeStorage,
  getDarkMode,
  setDarkMode,
} from './services/storage';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AuthModal } from './components/auth/AuthModal';
import { NotificationModal } from './components/NotificationModal';
import { ToastContainer, ToastItem } from './components/common/Toast';

// Student views
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

import { Menu, X, Sparkles, Compass, ShieldCheck, Building2, User as UserIcon } from 'lucide-react';

export default function App() {
  const [currentUser, setUser] = useState<User | null>(() => getCurrentUser());
  const [currentView, setCurrentView] = useState<string>('jobs');
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
      addToast(`Beralih peran ke: ${role.toUpperCase()} (${target.nama})`, 'info');
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

      {/* Quick Role Switch Bar for Easy Testing */}
      <div className="bg-indigo-900/90 text-white px-4 py-2 text-xs border-b border-indigo-800 flex flex-wrap items-center justify-between gap-2 z-20">
        <div className="flex items-center gap-2">
          <span className="font-extrabold uppercase tracking-wider text-[10px] bg-indigo-500/40 px-2 py-0.5 rounded-full border border-indigo-400/30">
            Pilih Peran Demo:
          </span>
          <span className="text-indigo-200 hidden sm:inline">
            Uji alur multi-peran secara instan:
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleRoleSwitch('mahasiswa')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              currentUser?.role === 'mahasiswa'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'bg-indigo-800/80 hover:bg-indigo-700 text-indigo-100'
            }`}
          >
            <UserIcon className="w-3 h-3" />
            <span>Mahasiswa</span>
          </button>

          <button
            onClick={() => handleRoleSwitch('perusahaan')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              currentUser?.role === 'perusahaan'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'bg-indigo-800/80 hover:bg-indigo-700 text-indigo-100'
            }`}
          >
            <Building2 className="w-3 h-3" />
            <span>Mitra Perusahaan</span>
          </button>

          <button
            onClick={() => handleRoleSwitch('admin')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              currentUser?.role === 'admin'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'bg-indigo-800/80 hover:bg-indigo-700 text-indigo-100'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Admin</span>
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
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
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
                InternSpace Platform v1.0
              </div>
            </div>
            <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {/* GUEST OR MAHASISWA VIEWS */}
          {(!currentUser || currentUser.role === 'mahasiswa') && (
            <>
              {currentView === 'jobs' && (
                <JobsExplorer
                  currentUser={currentUser}
                  onNotify={addToast}
                  onNavigateToAuth={() => handleOpenAuth('login')}
                />
              )}
              {currentUser && currentView === 'student-dashboard' && (
                <StudentDashboard
                  currentUser={currentUser}
                  onNavigate={(view) => setCurrentView(view)}
                />
              )}
              {currentUser && currentView === 'applications' && (
                <MyApplications
                  currentUser={currentUser}
                  onNotify={addToast}
                  onNavigateToJobs={() => setCurrentView('jobs')}
                />
              )}
              {currentUser && currentView === 'saved-jobs' && (
                <SavedJobs
                  currentUser={currentUser}
                  onNotify={addToast}
                  onNavigateToJobs={() => setCurrentView('jobs')}
                />
              )}
              {currentUser && currentView === 'profile' && (
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
            handleUserChange(user);
            addToast(`Selamat datang, ${user.nama}! Berhasil masuk sebagai ${user.role}.`, 'success');
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
