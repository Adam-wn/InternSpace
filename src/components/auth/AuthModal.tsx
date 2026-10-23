import React, { useState, useEffect } from 'react';
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
  Info,
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
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);

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

  // Student specific (Mahasiswa)
  const [universitas, setUniversitas] = useState('Universitas Indonesia');
  const [jurusan, setJurusan] = useState('Teknik Informatika');
  const [semester, setSemester] = useState<number>(5);

  // Company specific
  const [namaPerusahaan, setNamaPerusahaan] = useState('');
  const [industri, setIndustri] = useState('Teknologi Informasi & Software');
  const [kota, setKota] = useState('Jakarta Selatan');

  const [isSuperAdminGate, setIsSuperAdminGate] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Synchronize when modal opens with initial values
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg('');
      if (initialRole === 'admin') {
        setIsSuperAdminGate(true);
        setSelectedRole('admin');
        setEmail(SYSTEM_ADMIN_EMAIL);
        setPassword('password123');
        setNama('Adam (Admin Utama)');
      } else {
        setIsSuperAdminGate(false);
        setSelectedRole(initialRole || 'siswa_sma');
        setEmail('');
        setPassword('');
        setNama('');
      }
    }
  }, [isOpen, initialMode, initialRole]);

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg('');
    if (role === 'admin') {
      setIsSuperAdminGate(true);
      setEmail(SYSTEM_ADMIN_EMAIL);
      setNama('Adam (Admin Utama)');
    } else {
      if (email === SYSTEM_ADMIN_EMAIL) {
        setEmail('');
        setNama('');
      }
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setIsGoogleLoading(true);
    try {
      const user = await signInWithGoogle(selectedRole);
      // Khusus akun pemilik: otomatis diberikan hak Admin Utama
      if (user.email.toLowerCase() === SYSTEM_ADMIN_EMAIL.toLowerCase()) {
        user.role = 'admin';
        user.nama = 'Adam (Admin Utama)';
        setCurrentUser(user);
        window.dispatchEvent(new Event('internspace_data_changed'));
        onSuccess(`Selamat datang kembali, Pemilik Sistem: ${user.nama} (ADMIN)`);
        onClose();
        return;
      }

      // Jika mencoba masuk ke gate admin tapi akun Google BUKAN adamvkedua2@gmail.com
      if (isSuperAdminGate || selectedRole === 'admin') {
        setCurrentUser(null);
        setErrorMsg(`Akses Ditolak: Hak akses Admin hanya boleh untuk akun pemilik (${SYSTEM_ADMIN_EMAIL}). Akun Google Anda (${user.email}) tidak berwenang.`);
        setIsGoogleLoading(false);
        return;
      }

      // Pengguna publik (siswa, mahasiswa, mitra perusahaan)
      if (user.role === 'admin') {
        user.role = selectedRole;
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

    const cleanEmail = email.trim().toLowerCase();
    const isSuperAdminEmail = cleanEmail === SYSTEM_ADMIN_EMAIL.toLowerCase();

    // Verifikasi ketat: jika di gate Admin, email WAJIB adamvkedua2@gmail.com
    if (isSuperAdminGate && !isSuperAdminEmail) {
      setErrorMsg(`Akses Ditolak: Hak akses Admin hanya boleh untuk email pemilik (${SYSTEM_ADMIN_EMAIL}). Perangkat dan akun lain tidak diizinkan.`);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const targetRole = isSuperAdminEmail ? 'admin' : selectedRole;
      const result = loginUser(email, targetRole);
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

    if (selectedRole === 'admin') {
      if (email.trim().toLowerCase() !== SYSTEM_ADMIN_EMAIL.toLowerCase()) {
        setErrorMsg(`Pendaftaran Admin ditolak: Peran Admin hanya boleh untuk akun pemilik (${SYSTEM_ADMIN_EMAIL}).`);
        return;
      }
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
        namaPerusahaan,
        industri,
        kota,
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
      setErrorMsg(result.error || 'Akun tidak tersedia.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isSuperAdminGate
          ? 'Portal Pemilik Sistem (Super Admin)'
          : mode === 'login'
          ? 'Masuk ke InternSpace'
          : 'Daftar Akun InternSpace'
      }
      subtitle={
        isSuperAdminGate
          ? 'Area terbatas khusus akun resmi adamvkedua2@gmail.com'
          : 'Pilih peran akun Anda untuk melanjutkan:'
      }
      maxWidth="lg"
    >
      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-200 text-xs font-medium flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isSuperAdminGate ? (
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs">
            <div className="flex items-center gap-2 font-bold text-purple-900 dark:text-purple-100 mb-1">
              <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Otorisasi Khusus Pemilik Sistem (Adam)</span>
            </div>
            <p className="text-[11px] text-purple-700 dark:text-purple-300 leading-relaxed">
              Panel Administrator dilindungi secara ketat. Hanya akun resmi pemilik sistem (<strong className="underline">{SYSTEM_ADMIN_EMAIL}</strong>) yang dapat masuk. Akun atau perangkat lain akan ditolak secara otomatis oleh sistem keamanan.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Administrator
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-purple-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  id="admin-email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={SYSTEM_ADMIN_EMAIL}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-purple-500/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-purple-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  id="admin-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password akun Anda"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              id="admin-submit-btn"
              className="w-full py-2.5 rounded-xl font-bold text-xs shadow-md shadow-purple-500/20 bg-purple-600 hover:bg-purple-700 text-white transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Memverifikasi Akses...' : 'Masuk Sebagai Admin Utama'}</span>
            </button>
          </form>

          {/* Google Sign In for Admin */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              disabled={isGoogleLoading}
              onClick={handleGoogleAuth}
              id="admin-google-btn"
              className="w-full py-2.5 px-3 rounded-xl border border-purple-200 dark:border-purple-800 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isGoogleLoading ? 'Menghubungkan...' : 'Masuk via Google (adamvkedua2@gmail.com)'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsSuperAdminGate(false);
              setErrorMsg('');
              setSelectedRole('siswa_sma');
              setEmail('');
              setPassword('');
            }}
            className="w-full text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium py-1 cursor-pointer"
          >
            ← Kembali ke Menu Publik
          </button>
        </div>
      ) : (
        <>
          {/* MODE TABS: MASUK (LOGIN) vs DAFTAR (REGISTER) */}
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

          {/* 3 ROLES SELECTOR CARDS (PUBLIC ONLY) */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                {mode === 'login' ? '1. Pilih Peran Masuk:' : '1. Pilih Peran yang Didaftarkan:'}
              </label>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                3 Pilihan Peran
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* 1. Siswa SMA / SMK */}
              <button
                type="button"
                id="role-opt-siswa"
                onClick={() => handleSelectRole('siswa_sma')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                  selectedRole === 'siswa_sma'
                    ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 ring-2 ring-amber-500/30 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                    <School className="w-4 h-4" />
                  </div>
                  {selectedRole === 'siswa_sma' && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-amber-200 dark:ring-amber-900" />
                  )}
                </div>
                <div className="font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate">
                  Siswa SMA/SMK
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">PKL & Logbook</div>
              </button>

              {/* 2. Mahasiswa */}
              <button
                type="button"
                id="role-opt-mahasiswa"
                onClick={() => handleSelectRole('mahasiswa')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                  selectedRole === 'mahasiswa'
                    ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 ring-2 ring-emerald-500/30 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  {selectedRole === 'mahasiswa' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900" />
                  )}
                </div>
                <div className="font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate">
                  Mahasiswa
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Magang & CV</div>
              </button>

              {/* 3. Perusahaan Mitra */}
              <button
                type="button"
                id="role-opt-perusahaan"
                onClick={() => handleSelectRole('perusahaan')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                  selectedRole === 'perusahaan'
                    ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/40 ring-2 ring-sky-500/30 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  {selectedRole === 'perusahaan' && (
                    <span className="w-2 h-2 rounded-full bg-sky-500 ring-2 ring-sky-200 dark:ring-sky-900" />
                  )}
                </div>
                <div className="font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate">
                  Perusahaan
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Buka Lowongan</div>
              </button>
            </div>
          </div>

          {/* QUICK 1-CLICK DEMO ACCESS BOX */}
          <div className="mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                1-Klik Masuk Langsung (Akun Resmi Terverifikasi):
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
                  Anisa Rahmawati (SMK Negeri 1 Jakarta)
                </div>
                <div className="text-[10px] text-slate-500">
                  Jurusan RPL • Masuk ke Portal Siswa PKL & Jurnal Logbook
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
                  Teknik Informatika • Masuk ke Portal Mahasiswa & Lamaran
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-600" />
          </button>
        )}

        {selectedRole === 'perusahaan' && (
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Masuk sebagai Akun Resmi 10 Perusahaan:</span>
              <span className="text-[10px] text-sky-600 dark:text-sky-400 font-normal">Pilih & klik langsung</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {[
                { name: 'Google Indonesia', email: 'careers-id@google.com', logo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=60&auto=format&fit=crop&q=80' },
                { name: 'Apple Dev Academy @BINUS', email: 'academy@binus.edu', logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=60&auto=format&fit=crop&q=80' },
                { name: 'Samsung R&D (SRIN)', email: 'recruitment.srin@samsung.com', logo: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=60&auto=format&fit=crop&q=80' },
                { name: 'Samsung Electronics (SEIN)', email: 'hrd.sein@samsung.com', logo: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=60&auto=format&fit=crop&q=80' },
                { name: 'PT Sony Indonesia', email: 'careers@sony.co.id', logo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=60&auto=format&fit=crop&q=80' },
                { name: 'Microsoft Indonesia', email: 'recruitment@microsoft.com', logo: 'https://images.unsplash.com/photo-1642132652075-2b22557088b9?w=60&auto=format&fit=crop&q=80' },
                { name: 'Oracle Indonesia', email: 'careers-id@oracle.com', logo: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=60&auto=format&fit=crop&q=80' },
                { name: 'Gojek', email: 'internship@gojek.com', logo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=60&auto=format&fit=crop&q=80' },
                { name: 'Bank Central Asia (BCA)', email: 'karir@bca.co.id', logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=60&auto=format&fit=crop&q=80' },
                { name: 'Telkomsel', email: 'internship@telkomsel.co.id', logo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=60&auto=format&fit=crop&q=80' },
                { name: 'PT Teknologi Nusantara', email: 'hr@teknusantara.co.id', logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=60&auto=format&fit=crop&q=80' },
              ].map((comp) => (
                <button
                  key={comp.email}
                  type="button"
                  onClick={() => handleQuickDemoLogin(comp.email, 'perusahaan', comp.name)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-left transition-all cursor-pointer flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={comp.logo}
                      alt={comp.name}
                      className="w-6 h-6 rounded-lg object-cover shrink-0 border border-slate-200"
                    />
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                        {comp.name}
                      </div>
                      <div className="text-[9px] text-slate-400 truncate">
                        {comp.email}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FIREBASE GOOGLE AUTH BUTTON */}
      <div className="mb-4">
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
                    : 'Perusahaan Mitra'
                }`}
          </span>
        </button>
        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[10px]">
            <span className="bg-white dark:bg-slate-900 px-2 text-slate-400">
              atau gunakan formulir {mode === 'login' ? 'login' : 'daftar'}
            </span>
          </div>
        </div>
      </div>

      {/* FORM: LOGIN OR REGISTER */}
      {mode === 'login' ? (
        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Akun
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
              selectedRole === 'admin'
                ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20'
                : selectedRole === 'siswa_sma'
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                : selectedRole === 'mahasiswa'
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                : 'bg-sky-600 hover:bg-sky-700 shadow-sky-500/20'
            }`}
          >
            {isSubmitting
              ? 'Memproses Masuk...'
              : `Masuk sebagai ${
                  selectedRole === 'admin'
                    ? 'Admin Utama'
                    : selectedRole === 'siswa_sma'
                    ? 'Siswa SMA/SMK'
                    : selectedRole === 'mahasiswa'
                    ? 'Mahasiswa'
                    : 'Perusahaan Mitra'
                }`}
          </button>
        </form>
      ) : (
        /* REGISTER FORM - HANDLES 3 PUBLIC ROLES */
        <form onSubmit={handleRegister} className="space-y-3">
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
                  placeholder={
                    selectedRole === 'siswa_sma'
                      ? 'Anisa Rahmawati'
                      : selectedRole === 'mahasiswa'
                      ? 'Dimas Pratama'
                      : 'Budi Santoso'
                  }
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Pendaftaran *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder={selectedRole === 'admin' ? SYSTEM_ADMIN_EMAIL : 'nama@email.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* ROLE SPECIFIC: SISWA SMA / SMK */}
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
                    placeholder="e.g. Rekayasa Perangkat Lunak (RPL)"
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
                    No. WhatsApp *
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

          {/* ROLE SPECIFIC: MAHASISWA */}
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

          {/* ROLE SPECIFIC: PERUSAHAAN */}
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
            className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer text-white disabled:opacity-60 ${
              selectedRole === 'siswa_sma'
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                : selectedRole === 'mahasiswa'
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                : 'bg-sky-600 hover:bg-sky-700 shadow-sky-500/20'
            }`}
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
        </>
      )}

      {/* Akses Khusus Pemilik Sistem (adamvkedua2@gmail.com) */}
      {!isSuperAdminGate && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            type="button"
            id="open-super-admin-gate"
            onClick={() => {
              setIsSuperAdminGate(true);
              setEmail(SYSTEM_ADMIN_EMAIL);
              setPassword('password123');
              setErrorMsg('');
            }}
            className="text-[11px] text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Portal Akses Pemilik Sistem (adamvkedua2@gmail.com)</span>
          </button>
        </div>
      )}
    </Modal>
  );
};
