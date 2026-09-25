import React, { useState } from 'react';
import { User, InAppNotification, UserRole } from '../types';
import {
  Briefcase,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Sparkles,
  Menu,
  X,
  GraduationCap,
  Building2,
  ShieldCheck,
  School,
} from 'lucide-react';
import { RoleBadge } from './common/Badge';
import { setCurrentUser, getUsers, setDarkMode } from '../services/storage';

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
  onRoleSwitch?: (role: UserRole) => void;
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
  onRoleSwitch,
  onToggleMobileMenu,
  isMobileMenuOpen,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isMenuOpen = mobileMenuOpen ?? isMobileMenuOpen ?? false;
  const toggleMobile = onToggleMobileMenu || (() => setMobileMenuOpen?.(!isMenuOpen));

  const unreadCount =
    unreadNotificationCount !== undefined
      ? unreadNotificationCount
      : (notifications ? notifications.filter((n) => !n.isRead).length : 0);

  const handleSwitchUser = (userId: string) => {
    const allUsers = getUsers();
    const target = allUsers.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      setShowRoleSwitcher(false);
      if (onRoleSwitch) {
        onRoleSwitch(target.role);
      }
      onNotify?.(`Beralih akun ke: ${target.nama} (${target.role.toUpperCase()})`);
      // Default views per role
      if (onNavigate) {
        if (target.role === 'siswa_sma') onNavigate('siswa-dashboard');
        else if (target.role === 'mahasiswa') onNavigate('jobs');
        else if (target.role === 'perusahaan') onNavigate('company-dashboard');
        else if (target.role === 'admin') onNavigate('admin-dashboard');
      }
    }
  };

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
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobile}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
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

        {/* Center: Active Role Badge / Switcher */}
        {currentUser && (
          <div className="hidden md:flex items-center relative">
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              id="role-switcher-button"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors border border-slate-200/80 dark:border-slate-700"
            >
              <span className="text-slate-500">Peran Aktif:</span>
              <RoleBadge role={currentUser.role} />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Quick Switch Dropdown */}
            {showRoleSwitcher && (
              <div
                className="absolute top-10 left-1/2 -translate-x-1/2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShowRoleSwitcher(false)}
              >
                <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Ganti Akun & Peran Cepat:
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => handleSwitchUser('user-siswa-1')}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left text-xs transition-colors ${
                      currentUser.id === 'user-siswa-1'
                        ? 'bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200 font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <School className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <div>Anisa Rahmawati</div>
                      <div className="text-[10px] text-slate-500">🎒 Siswa SMA / SMK (PKL)</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSwitchUser('user-stud-1')}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left text-xs transition-colors ${
                      currentUser.id === 'user-stud-1'
                        ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200 font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div>Dimas Pratama</div>
                      <div className="text-[10px] text-slate-500">🎓 Mahasiswa (UI)</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSwitchUser('user-comp-1')}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left text-xs transition-colors ${
                      currentUser.id === 'user-comp-1'
                        ? 'bg-sky-50 text-sky-900 dark:bg-sky-950/50 dark:text-sky-200 font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-sky-600 shrink-0" />
                    <div>
                      <div>PT Teknologi Nusantara</div>
                      <div className="text-[10px] text-slate-500">Perusahaan Mitra</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSwitchUser('user-admin-1')}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left text-xs transition-colors ${
                      currentUser.id === 'user-admin-1'
                        ? 'bg-purple-50 text-purple-900 dark:bg-purple-950/50 dark:text-purple-200 font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <div>Budi Santoso</div>
                      <div className="text-[10px] text-slate-500">Admin Utama</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Right Actions: Dark Mode, Notifications, User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            id="dark-mode-toggle"
            title={darkMode ? 'Beralih ke Terang' : 'Beralih ke Gelap'}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Notifications Bell */}
          {currentUser && (
            <button
              onClick={onOpenNotifications}
              id="notifications-bell-button"
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                  className="absolute right-0 top-12 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser.nama}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                  </div>

                  {currentUser.role === 'mahasiswa' && (
                    <button
                      onClick={() => onNavigate?.('profile')}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      Profil Saya & CV
                    </button>
                  )}

                  {currentUser.role === 'perusahaan' && (
                    <button
                      onClick={() => onNavigate?.('company-profile')}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Building2 className="w-4 h-4 text-slate-400" />
                      Profil Perusahaan
                    </button>
                  )}

                  <button
                    onClick={handleLogoutAction}
                    id="logout-button"
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors font-medium mt-1"
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
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 transition-colors"
              >
                Masuk
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                id="register-nav-button"
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
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
