import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { UserRole } from '../../types';
import { registerUser, loginUser, getUsers, setCurrentUser } from '../../services/storage';
import { signInWithGoogle } from '../../services/firestoreSync';
import { GraduationCap, Building2, ShieldCheck, Mail, Lock, User as UserIcon, Phone, Globe, MapPin, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  initialMode?: 'login' | 'register';
  initialRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
  initialRole = 'mahasiswa',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nama, setNama] = useState('');
  const [noHp, setNoHp] = useState('');

  // Student specific
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

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setIsGoogleLoading(true);
    try {
      const user = await signInWithGoogle(selectedRole);
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

    setIsSubmitting(true);
    setTimeout(() => {
      const result = loginUser(email);
      setIsSubmitting(false);
      if (result.success && result.user) {
        onSuccess(`Selamat datang kembali, ${result.user.nama}!`);
        onClose();
      } else {
        setErrorMsg(result.error || 'Login gagal.');
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
        universitas,
        jurusan,
        semester,
        namaPerusahaan,
        industri,
        kota,
        website,
        noHp,
      });

      setIsSubmitting(false);
      if (res.success && res.user) {
        loginUser(res.user.email);
        onSuccess(`Pendaftaran berhasil! Selamat datang di InternSpace, ${res.user.nama}.`);
        onClose();
      } else {
        setErrorMsg(res.error || 'Pendaftaran gagal.');
      }
    }, 400);
  };

  const handleQuickDemoLogin = (demoEmail: string, roleName: string) => {
    setErrorMsg('');
    const result = loginUser(demoEmail);
    if (result.success && result.user) {
      onSuccess(`Masuk sebagai akun demo: ${result.user.nama} (${roleName})`);
      onClose();
    } else {
      setErrorMsg(result.error || 'Akun demo tidak tersedia.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'login' ? 'Masuk ke InternSpace' : 'Daftar Akun Baru'}
      subtitle={
        mode === 'login'
          ? 'Akses dashboard magang Anda dengan akun terdaftar'
          : 'Pilih peran Anda dan mulai perjalanan karir magang'
      }
      maxWidth="lg"
    >
      {/* Mode Switcher Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setErrorMsg('');
          }}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
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
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            mode === 'register'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Daftar (Register)
        </button>
      </div>

      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-200 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* QUICK DEMO BUTTONS */}
      <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Akses Cepat Akun Demo:
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">1-Klik Langsung Masuk</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            id="demo-login-mahasiswa"
            onClick={() => handleQuickDemoLogin('dimas.pratama@ui.ac.id', 'Mahasiswa')}
            className="px-2.5 py-2 text-left rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-xs group"
          >
            <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              Mahasiswa
            </div>
            <div className="text-[10px] text-slate-500 truncate">Dimas Pratama</div>
          </button>

          <button
            type="button"
            id="demo-login-perusahaan"
            onClick={() => handleQuickDemoLogin('hr@teknusantara.co.id', 'Perusahaan')}
            className="px-2.5 py-2 text-left rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-sky-500 hover:bg-sky-50/30 transition-all text-xs group"
          >
            <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-sky-600" />
              Perusahaan
            </div>
            <div className="text-[10px] text-slate-500 truncate">PT TekNusa</div>
          </button>

          <button
            type="button"
            id="demo-login-admin"
            onClick={() => handleQuickDemoLogin('admin@internspace.id', 'Admin')}
            className="px-2.5 py-2 text-left rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-purple-500 hover:bg-purple-50/30 transition-all text-xs group"
          >
            <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              Admin
            </div>
            <div className="text-[10px] text-slate-500 truncate">Budi Santoso</div>
          </button>
        </div>
      </div>

      {/* FIREBASE GOOGLE AUTH BUTTON */}
      <div className="mb-5">
        <button
          type="button"
          id="firebase-google-auth-button"
          disabled={isGoogleLoading}
          onClick={handleGoogleAuth}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-60"
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
              : mode === 'login'
              ? 'Masuk Cepat dengan Google (Firebase)'
              : `Daftar dengan Google sebagai ${selectedRole.toUpperCase()} (Firebase)`}
          </span>
        </button>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white dark:bg-slate-900 px-2 text-slate-400">atau dengan email & password</span>
          </div>
        </div>
      </div>

      {mode === 'login' ? (
        /* LOGIN FORM */
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Terdaftar
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                id="login-email-input"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                id="login-password-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            id="login-submit-button"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-md transition-all disabled:opacity-60 mt-2"
          >
            {isSubmitting ? 'Memproses...' : 'Masuk ke Akun'}
          </button>
        </form>
      ) : (
        /* REGISTER FORM */
        <form onSubmit={handleRegister} className="space-y-4">
          {/* ROLE SELECTION CARDS */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Pilih Peran Anda
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div
                onClick={() => setSelectedRole('mahasiswa')}
                className={`p-3 rounded-xl border cursor-pointer text-center transition-all ${
                  selectedRole === 'mahasiswa'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <GraduationCap
                  className={`w-6 h-6 mx-auto mb-1.5 ${
                    selectedRole === 'mahasiswa' ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                />
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Mahasiswa</div>
                <div className="text-[10px] text-slate-500">Cari Magang</div>
              </div>

              <div
                onClick={() => setSelectedRole('perusahaan')}
                className={`p-3 rounded-xl border cursor-pointer text-center transition-all ${
                  selectedRole === 'perusahaan'
                    ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/30 ring-2 ring-sky-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <Building2
                  className={`w-6 h-6 mx-auto mb-1.5 ${
                    selectedRole === 'perusahaan' ? 'text-sky-600' : 'text-slate-400'
                  }`}
                />
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Perusahaan</div>
                <div className="text-[10px] text-slate-500">Buka Lowongan</div>
              </div>

              <div
                onClick={() => setSelectedRole('admin')}
                className={`p-3 rounded-xl border cursor-pointer text-center transition-all ${
                  selectedRole === 'admin'
                    ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-2 ring-purple-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <ShieldCheck
                  className={`w-6 h-6 mx-auto mb-1.5 ${
                    selectedRole === 'admin' ? 'text-purple-600' : 'text-slate-400'
                  }`}
                />
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Admin</div>
                <div className="text-[10px] text-slate-500">Moderasi</div>
              </div>
            </div>
          </div>

          {/* COMMON INPUTS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {selectedRole === 'perusahaan' ? 'Nama PIC / HR' : 'Nama Lengkap'}
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder={selectedRole === 'perusahaan' ? 'e.g. Siska Rahmawati' : 'e.g. Dimas Pratama'}
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* ROLE SPECIFIC FIELDS */}
          {selectedRole === 'mahasiswa' && (
            <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Universitas / Kampus
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Universitas Indonesia"
                    value={universitas}
                    onChange={(e) => setUniversitas(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jurusan / Program Studi
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ilmu Komputer"
                    value={jurusan}
                    onChange={(e) => setJurusan(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedRole === 'perusahaan' && (
            <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Resmi Perusahaan
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. PT Solusi Digital Pratama"
                    value={namaPerusahaan}
                    onChange={(e) => setNamaPerusahaan(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bidang Industri
                  </label>
                  <select
                    value={industri}
                    onChange={(e) => setIndustri(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="Teknologi Informasi & Software">Teknologi & IT</option>
                    <option value="Perbankan & Jasa Keuangan">Keuangan & Bank</option>
                    <option value="Desain Kreatif & Periklanan">Kreatif & Media</option>
                    <option value="Logistik & Manufaktur">Logistik & Manufaktur</option>
                    <option value="Kesehatan & Farmasi">Kesehatan</option>
                    <option value="Pendidikan & Riset">Pendidikan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kota Kantor
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jakarta Selatan"
                    value={kota}
                    onChange={(e) => setKota(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              <p className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg">
                ℹ️ Catatan: Pendaftaran akun perusahaan baru memerlukan verifikasi oleh Admin sebelum dapat mempublikasikan lowongan.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Buat Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          <button
            type="submit"
            id="register-submit-button"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm shadow-md transition-all disabled:opacity-60 mt-2"
          >
            {isSubmitting ? 'Mendaftarkan...' : `Daftar sebagai ${selectedRole.toUpperCase()}`}
          </button>
        </form>
      )}
    </Modal>
  );
};
