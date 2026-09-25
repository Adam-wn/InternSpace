import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { UserRole } from '../../types';
import { registerUser, loginUser, setCurrentUser, SYSTEM_ADMIN_EMAIL } from '../../services/storage';
import { signInWithGoogle } from '../../services/firestoreSync';
import {
  GraduationCap,
  Building2,
  ShieldCheck,
  Mail,
  Lock,
  User as UserIcon,
  Sparkles,
  School,
  ArrowRight,
  ShieldAlert,
  ChevronLeft,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  initialMode?: 'login' | 'register';
  initialRole?: UserRole;
  onNotify?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
  initialRole = 'siswa_sma',
  onNotify,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  // Default to non-admin roles unless explicitly passed
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    initialRole === 'admin' ? 'siswa_sma' : initialRole
  );
  const [isAdminPortal, setIsAdminPortal] = useState(initialRole === 'admin');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nama, setNama] = useState('');
  const [noHp, setNoHp] = useState('');

  // Siswa specific
  const [namaSekolah, setNamaSekolah] = useState('SMK Negeri 1 Jakarta');
  const [jurusanSiswa, setJurusanSiswa] = useState('Rekayasa Perangkat Lunak (RPL)');
  const [kelas, setKelas] = useState('Kelas XI (11) SMK');
  const [nisn, setNisn] = useState('');
  const [guruPembimbing, setGuruPembimbing] = useState('Drs. Bambang Hidayat, M.Kom');

  // Student specific (Mahasiswa)
  const [universitas, setUniversitas] = useState('Universitas Indonesia');
  const [jurusan, setJurusan] = useState('Teknik Informatika');
  const [semester, setSemester] = useState<number>(5);

  // Company specific
  const [namaPerusahaan, setNamaPerusahaan] = useState('');
  const [industri, setIndustri] = useState('Teknologi Informasi & Software');
  const [kota, setKota] = useState('Jakarta Selatan');
  const [website, setWebsite] = useState('https://');

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const activeRole: UserRole = isAdminPortal ? 'admin' : selectedRole;

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setIsGoogleLoading(true);
    try {
      const user = await signInWithGoogle(activeRole);
      // If attempting admin login, ensure email matches SYSTEM_ADMIN_EMAIL
      if (isAdminPortal && user.email.toLowerCase() !== SYSTEM_ADMIN_EMAIL.toLowerCase()) {
        setCurrentUser(null);
        setErrorMsg(`Akses Ditolak: Hak akses Admin hanya diberikan khusus untuk ${SYSTEM_ADMIN_EMAIL}.`);
        setIsGoogleLoading(false);
        return;
      }

      setCurrentUser(user);
      window.dispatchEvent(new Event('internspace_data_changed'));
      onSuccess(`Berhasil masuk via Google Firebase: ${user.nama} (${user.role.toUpperCase()})`);
      onClose();
    } catch (err: unknown) {
      console.error('Google auth error:', err);
      const msg = err instanceof Error ? err.message : 'Gagal login via Google Firebase.';
      setErrorMsg(msg);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email) {
      setErrorMsg('Harap masukkan alamat email.');
      return;
    }

    if (isAdminPortal && email.trim().toLowerCase() !== SYSTEM_ADMIN_EMAIL.toLowerCase()) {
      setErrorMsg(`Akses Ditolak: Hak akses Admin hanya diberikan khusus untuk pemilik sistem (${SYSTEM_ADMIN_EMAIL}).`);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const result = loginUser(email, activeRole);
      setIsSubmitting(false);
      if (result.success && result.user) {
        onSuccess(`Selamat datang kembali, ${result.user.nama}!`);
        onClose();
      } else {
        setErrorMsg(result.error || 'Login gagal. Periksa kembali email yang Anda masukkan.');
      }
    }, 300);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nama || !email) {
      setErrorMsg('Nama dan email wajib diisi.');
      return;
    }

    if (selectedRole === 'perusahaan' && !namaPerusahaan) {
      setErrorMsg('Nama perusahaan wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = registerUser({
        nama: selectedRole === 'perusahaan' ? namaPerusahaan : nama,
        email,
        password,
        role: selectedRole,
        universitas: selectedRole === 'siswa_sma' ? namaSekolah : universitas,
        namaSekolah,
        jurusan: selectedRole === 'siswa_sma' ? jurusanSiswa : jurusan,
        semester: selectedRole === 'siswa_sma' ? (kelas.includes('XII') ? 12 : 11) : semester,
        kelas,
        nisn,
        guruPembimbing,
        namaPerusahaan,
        industri,
        kota,
        website,
        noHp,
      });

      setIsSubmitting(false);
      if (res.success && res.user) {
        loginUser(res.user.email, selectedRole);
        onSuccess(`Pendaftaran berhasil! Selamat datang di InternSpace, ${res.user.nama}.`);
        onClose();
      } else {
        setErrorMsg(res.error || 'Pendaftaran gagal.');
      }
    }, 400);
  };

  const handleQuickDemoLogin = (demoEmail: string, role: UserRole, roleName: string) => {
    setErrorMsg('');
    const result = loginUser(demoEmail, role);
    if (result.success && result.user) {
      onSuccess(`Masuk sebagai: ${result.user.nama} (${roleName})`);
      onClose();
    } else {
      setErrorMsg(result.error || 'Akun demo tidak tersedia.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isAdminPortal
          ? 'Portal Khusus Admin Utama'
          : mode === 'login'
          ? 'Masuk ke InternSpace'
          : 'Daftar Akun Baru'
      }
      subtitle={
        isAdminPortal
          ? `Area terbatas pemilik sistem (${SYSTEM_ADMIN_EMAIL})`
          : mode === 'login'
          ? 'Pilih peran Anda (Siswa SMA, Mahasiswa, atau Mitra Perusahaan) untuk masuk ke portal:'
          : 'Pilih peran Anda dan mulai perjalanan karir magang & PKL terpadu'
      }
      maxWidth="lg"
    >
      {/* Mode Switcher Tabs (Only if not in Admin Portal) */}
      {!isAdminPortal && (
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-4">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Daftar (Register)
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-200 text-xs font-medium flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ADMIN PORTAL SPECIAL VIEW */}
      {isAdminPortal ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200">
            <div className="flex items-center gap-2 font-bold mb-1 text-sm text-purple-900 dark:text-purple-100">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              Autentikasi Hak Akses Admin Utama
            </div>
            <p className="text-purple-700 dark:text-purple-300 leading-relaxed text-[11px]">
              Sesuai otorisasi sistem, hak akses Admin Utama diberikan khusus dan eksklusif kepada{' '}
              <strong className="underline">{SYSTEM_ADMIN_EMAIL}</strong>.
            </p>
          </div>

          {/* Quick 1-click for Adam */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-2 flex items-center justify-between">
              <span>Masuk Cepat Verifikasi:</span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded-full">
                Khusus Pemilik
              </span>
            </div>
            <button
              type="button"
              id="admin-quick-login-btn"
              onClick={() => handleQuickDemoLogin(SYSTEM_ADMIN_EMAIL, 'admin', 'Admin Utama')}
              className="w-full p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Masuk sebagai Adam (Admin Utama)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Regular form for Admin */}
          <form onSubmit={handleLogin} className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Admin
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  id="admin-email-input"
                  placeholder={SYSTEM_ADMIN_EMAIL}
                  value={email || SYSTEM_ADMIN_EMAIL}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-purple-500/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? 'Memverifikasi...' : 'Konfirmasi Masuk Admin'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setIsAdminPortal(false);
              setSelectedRole('siswa_sma');
              setErrorMsg('');
            }}
            className="w-full pt-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Kembali ke Pilihan Peran Umum (Siswa / Mahasiswa / Perusahaan)</span>
          </button>
        </div>
      ) : mode === 'login' ? (
        /* LOGIN MODE WITH ROLE SELECTION: SISWA SMA, MAHASISWA, PERUSAHAAN */
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Langkah 1: Pilih Peran Masuk Anda
              </label>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                3 Peran Publik Tersedia
              </span>
            </div>

            {/* 3 ROLE CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* 1. Siswa SMA / SMK */}
              <button
                type="button"
                id="role-select-siswa"
                onClick={() => {
                  setSelectedRole('siswa_sma');
                  setErrorMsg('');
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  selectedRole === 'siswa_sma'
                    ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 ring-2 ring-amber-500/30 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-400 hover:bg-amber-50/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                    <School className="w-4 h-4" />
                  </div>
                  {selectedRole === 'siswa_sma' && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 ring-4 ring-amber-200 dark:ring-amber-900" />
                  )}
                </div>
                <div className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                  Siswa SMA / SMK
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Magang PKL & Logbook
                </div>
              </button>

              {/* 2. Mahasiswa */}
              <button
                type="button"
                id="role-select-mahasiswa"
                onClick={() => {
                  setSelectedRole('mahasiswa');
                  setErrorMsg('');
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  selectedRole === 'mahasiswa'
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500/30 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-400 hover:bg-emerald-50/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  {selectedRole === 'mahasiswa' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-200 dark:ring-emerald-900" />
                  )}
                </div>
                <div className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                  Mahasiswa
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Magang Kuliah & Riset
                </div>
              </button>

              {/* 3. Perusahaan Mitra */}
              <button
                type="button"
                id="role-select-perusahaan"
                onClick={() => {
                  setSelectedRole('perusahaan');
                  setErrorMsg('');
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  selectedRole === 'perusahaan'
                    ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 ring-2 ring-sky-500/30 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-400 hover:bg-sky-50/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  {selectedRole === 'perusahaan' && (
                    <span className="w-2 h-2 rounded-full bg-sky-500 ring-4 ring-sky-200 dark:ring-sky-900" />
                  )}
                </div>
                <div className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                  Perusahaan Mitra
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Buka Lowongan & Seleksi
                </div>
              </button>
            </div>
          </div>

          {/* ACTIVE ROLE INFO & 1-CLICK QUICK ACCESS */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Uji Masuk Cepat (1-Klik untuk Peran Terpilih):
              </span>
              <span className="text-[10px] text-slate-400 capitalize">
                Mode {selectedRole.replace('_', ' ')}
              </span>
            </div>

            {selectedRole === 'siswa_sma' && (
              <button
                type="button"
                id="quick-demo-siswa-btn"
                onClick={() =>
                  handleQuickDemoLogin(
                    'anisa.rahmawati@smkn1jakarta.sch.id',
                    'siswa_sma',
                    'Siswa SMA/SMK (PKL)'
                  )
                }
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                    <School className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Anisa Rahmawati (Siswa SMK Negeri 1 Jakarta)
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Jurusan RPL • Mengakses Portal Siswa PKL & Jurnal Harian
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-600" />
              </button>
            )}

            {selectedRole === 'mahasiswa' && (
              <button
                type="button"
                id="quick-demo-mahasiswa-btn"
                onClick={() =>
                  handleQuickDemoLogin('dimas.pratama@ui.ac.id', 'mahasiswa', 'Mahasiswa')
                }
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-left transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                    <GraduationCap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Dimas Pratama (Universitas Indonesia)
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Teknik Informatika • Mengakses Portal Mahasiswa & Lamaran
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600" />
              </button>
            )}

            {selectedRole === 'perusahaan' && (
              <button
                type="button"
                id="quick-demo-perusahaan-btn"
                onClick={() =>
                  handleQuickDemoLogin('hr@teknusantara.co.id', 'perusahaan', 'Mitra Perusahaan')
                }
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-sky-300 dark:border-sky-800 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-left transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 flex items-center justify-center">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      PT Teknologi Nusantara (HR Recruitment)
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Software House • Mengakses Dashboard Manajemen Lowongan
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-sky-600" />
              </button>
            )}
          </div>

          {/* FIREBASE GOOGLE AUTH BUTTON */}
          <div>
            <button
              type="button"
              id="firebase-google-auth-button"
              disabled={isGoogleLoading}
              onClick={handleGoogleAuth}
              className="w-full flex items-center justify-center gap-2.5 py-2 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>
                {isGoogleLoading
                  ? 'Menghubungkan ke Firebase...'
                  : `Masuk Google sebagai ${
                      selectedRole === 'siswa_sma'
                        ? 'Siswa SMA/SMK'
                        : selectedRole === 'mahasiswa'
                        ? 'Mahasiswa'
                        : 'Mitra Perusahaan'
                    }`}
              </span>
            </button>
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-400">
                  atau gunakan email & password
                </span>
              </div>
            </div>
          </div>

          {/* STANDARD LOGIN FORM */}
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Terdaftar
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  id="login-email-input"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  id="login-password-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              id="login-submit-button"
              className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer text-white disabled:opacity-60 ${
                selectedRole === 'siswa_sma'
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                  : selectedRole === 'mahasiswa'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                  : 'bg-sky-600 hover:bg-sky-700 shadow-sky-500/20'
              }`}
            >
              {isSubmitting
                ? 'Memproses...'
                : `Masuk sebagai ${
                    selectedRole === 'siswa_sma'
                      ? 'Siswa SMA/SMK'
                      : selectedRole === 'mahasiswa'
                      ? 'Mahasiswa'
                      : 'Perusahaan Mitra'
                  }`}
            </button>
          </form>

          {/* ADMIN RESTRICTED PORTAL LINK */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              type="button"
              onClick={() => {
                setIsAdminPortal(true);
                setErrorMsg('');
                setEmail(SYSTEM_ADMIN_EMAIL);
              }}
              className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-800 flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Login Khusus Pemilik Sistem (Admin Utama)</span>
            </button>
          </div>
        </div>
      ) : (
        /* REGISTER FORM - ONLY 3 ROLES AVAILABLE TO THE PUBLIC */
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Pilih Peran Akun Anda (3 Peran Publik):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div
                onClick={() => setSelectedRole('siswa_sma')}
                className={`p-2.5 rounded-xl border cursor-pointer text-center transition-all ${
                  selectedRole === 'siswa_sma'
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 ring-2 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <School
                  className={`w-5 h-5 mx-auto mb-1 ${
                    selectedRole === 'siswa_sma' ? 'text-amber-600' : 'text-slate-400'
                  }`}
                />
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Siswa SMA / SMK
                </div>
                <div className="text-[10px] text-slate-500">PKL & Magang Kejuruan</div>
              </div>

              <div
                onClick={() => setSelectedRole('mahasiswa')}
                className={`p-2.5 rounded-xl border cursor-pointer text-center transition-all ${
                  selectedRole === 'mahasiswa'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <GraduationCap
                  className={`w-5 h-5 mx-auto mb-1 ${
                    selectedRole === 'mahasiswa' ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                />
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Mahasiswa</div>
                <div className="text-[10px] text-slate-500">Cari Magang & Riset</div>
              </div>

              <div
                onClick={() => setSelectedRole('perusahaan')}
                className={`p-2.5 rounded-xl border cursor-pointer text-center transition-all ${
                  selectedRole === 'perusahaan'
                    ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/30 ring-2 ring-sky-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <Building2
                  className={`w-5 h-5 mx-auto mb-1 ${
                    selectedRole === 'perusahaan' ? 'text-sky-600' : 'text-slate-400'
                  }`}
                />
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Perusahaan Mitra</div>
                <div className="text-[10px] text-slate-500">Buka Lowongan Magang</div>
              </div>
            </div>
          </div>

          {/* COMMON INPUTS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {selectedRole === 'perusahaan' ? 'Nama PIC / HR' : 'Nama Lengkap'} *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder={selectedRole === 'siswa_sma' ? 'e.g. Anisa Rahmawati' : 'e.g. Dimas Pratama'}
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Aktif *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* ROLE SPECIFIC FIELDS: SISWA SMA / SMK */}
          {selectedRole === 'siswa_sma' && (
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Asal Sekolah (SMK / SMA) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SMK Negeri 1 Jakarta"
                    value={namaSekolah}
                    onChange={(e) => setNamaSekolah(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jurusan / Peminatan Kejuruan *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RPL, TKJ, DKV, Akuntansi"
                    value={jurusanSiswa}
                    onChange={(e) => setJurusanSiswa(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kelas / Tingkat *
                  </label>
                  <select
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Kelas X (10) SMK">Kelas X (10) SMK</option>
                    <option value="Kelas XI (11) SMK">Kelas XI (11) SMK</option>
                    <option value="Kelas XII (12) SMK">Kelas XII (12) SMK</option>
                    <option value="Kelas XI (11) SMA">Kelas XI (11) SMA</option>
                    <option value="Kelas XII (12) SMA">Kelas XII (12) SMA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    NISN Siswa
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 0061298451"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    No. WhatsApp Siswa *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0812xxxx"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ROLE SPECIFIC FIELDS: MAHASISWA */}
          {selectedRole === 'mahasiswa' && (
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Universitas / Kampus *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Universitas Indonesia"
                    value={universitas}
                    onChange={(e) => setUniversitas(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jurusan / Program Studi *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ilmu Komputer"
                    value={jurusan}
                    onChange={(e) => setJurusan(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="tel"
                    placeholder="0812xxxx"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ROLE SPECIFIC FIELDS: PERUSAHAAN */}
          {selectedRole === 'perusahaan' && (
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Resmi Perusahaan *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. PT Solusi Digital Pratama"
                    value={namaPerusahaan}
                    onChange={(e) => setNamaPerusahaan(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bidang Industri
                  </label>
                  <input
                    type="text"
                    value={industri}
                    onChange={(e) => setIndustri(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kota Domisili
                  </label>
                  <input
                    type="text"
                    value={kota}
                    onChange={(e) => setKota(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Buat Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-60"
          >
            {isSubmitting
              ? 'Mendaftarkan Akun...'
              : `Daftar Akun Sebagai ${
                  selectedRole === 'siswa_sma'
                    ? 'Siswa SMA/SMK'
                    : selectedRole === 'mahasiswa'
                    ? 'Mahasiswa'
                    : 'Perusahaan Mitra'
                }`}
          </button>
        </form>
      )}
    </Modal>
  );
};
