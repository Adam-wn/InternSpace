import React, { useState } from 'react';
import { User, InAppNotification } from '../types';
import {
  Briefcase,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Building2,
  School,
} from 'lucide-react';
import { RoleBadge } from './common/Badge';
import { setCurrentUser } from '../services/storage';

interface NavbarProps {
  currentUser: User | null;
  notifications?: InAppNotification[];
  unreadNotificationCount?: number;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenNotifications: () => void;
  onNavigate?: (view: string) => void;
  currentView?: string;
  onNotify?: (message: string) => void;
  onLogout?: () => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  notifications,
  unreadNotificationCount,
  darkMode = false,
  onToggleDarkMode,
  onOpenAuth,
  onOpenNotifications,
  onNavigate,
  currentView,
  onNotify,
  onLogout,
  onToggleMobileMenu,
  isMobileMenuOpen,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isMenuOpen = mobileMenuOpen ?? isMobileMenuOpen ?? false;
  const toggleMobile = onToggleMobileMenu || (() => setMobileMenuOpen?.(!isMenuOpen));

  const unreadCount =
    unreadNotificationCount !== undefined
      ? unreadNotificationCount
      : (notifications ? notifications.filter((n) => !n.isRead).length : 0);

  const handleLogoutAction = () => {
    if (onLogout) {
      onLogout();
    } else {
      setCurrentUser(null);
      onNotify?.('Anda telah keluar dari akun.');
    }
    setShowProfileMenu(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobile}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={() => {
              if (onNavigate) {
                if (currentUser?.role === 'siswa_sma') onNavigate('siswa-dashboard');
                else if (currentUser?.role === 'mahasiswa') onNavigate('jobs');
                else if (currentUser?.role === 'perusahaan') onNavigate('company-dashboard');
                else if (currentUser?.role === 'admin') onNavigate('admin-dashboard');
                else onNavigate('jobs');
              }
            }}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
            id="brand-logo"
          >
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-linear-to-r from-slate-900 to-indigo-900 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                  InternSpace
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hidden sm:inline-block">
                  HUB
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hidden lg:inline-flex items-center gap-1" title="Tersambung ke Google Firebase Firestore">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Firebase
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Active Role Badge (Display only, no arbitrary switching without login) */}
        {currentUser && (
          <div className="hidden md:flex items-center gap-2 bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1 rounded-full border border-slate-200/80 dark:border-slate-700">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Peran Aktif:</span>
            <RoleBadge role={currentUser.role} />
          </div>
        )}

        {/* Right Actions: Dark Mode, Notifications, User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            id="dark-mode-toggle"
            title={darkMode ? 'Beralih ke Terang' : 'Beralih ke Gelap'}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle Mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Notifications Bell */}
          {currentUser && (
            <button
              onClick={onOpenNotifications}
              id="notifications-bell-button"
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Notifikasi"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}

          {/* User Profile / Auth Actions */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                id="user-profile-menu-button"
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <img
                  src={
                    currentUser.avatarUrl ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={currentUser.nama}
                  className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                />
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight max-w-[120px] truncate">
                    {currentUser.nama}
                  </div>
                  <div className="text-[10px] text-slate-500 capitalize">{currentUser.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Menu Dropdown */}
              {showProfileMenu && (
                <div
                  className="absolute right-0 top-12 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser.nama}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    <div className="mt-1">
                      <RoleBadge role={currentUser.role} />
                    </div>
                  </div>

                  {currentUser.role === 'siswa_sma' && (
                    <button
                      onClick={() => onNavigate?.('profile')}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <School className="w-4 h-4 text-amber-500" />
                      Profil Siswa & Berkas PKL
                    </button>
                  )}

                  {currentUser.role === 'mahasiswa' && (
                    <button
                      onClick={() => onNavigate?.('profile')}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-emerald-500" />
                      Profil Saya & CV
                    </button>
                  )}

                  {currentUser.role === 'perusahaan' && (
                    <button
                      onClick={() => onNavigate?.('company-profile')}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Building2 className="w-4 h-4 text-sky-500" />
                      Profil Perusahaan
                    </button>
                  )}

                  <button
                    onClick={handleLogoutAction}
                    id="logout-button"
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors font-medium mt-1 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    Keluar (Logout)
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                id="login-nav-button"
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                Masuk
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                id="register-nav-button"
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Daftar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
