import React, { useMemo } from 'react';
import { User } from '../../types';
import {
  getJobs,
  getApplicationsByStudent,
  getPklLogs,
  getStudentProfile,
} from '../../services/storage';
import { KompensasiBadge, TargetJenjangBadge } from '../common/Badge';
import {
  GraduationCap,
  Briefcase,
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  Compass,
  ArrowRight,
  Sparkles,
  School,
  FileCheck,
  ShieldCheck,
  Award,
  BookOpen,
  MapPin,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';

interface SiswaDashboardProps {
  currentUser: User;
  onNavigate: (view: string) => void;
}

export const SiswaDashboard: React.FC<SiswaDashboardProps> = ({ currentUser, onNavigate }) => {
  const profile = getStudentProfile(currentUser.id);
  const applications = getApplicationsByStudent(currentUser.id);
  const pklLogs = getPklLogs(currentUser.id);
  const allJobs = getJobs();

  // Lowongan yang cocok untuk siswa SMA/SMK
  const siswaJobs = useMemo(() => {
    return allJobs.filter(
      (j) => j.status === 'aktif' && (j.targetJenjang === 'siswa_sma' || j.targetJenjang === 'semua')
    );
  }, [allJobs]);

  const acceptedApps = applications.filter((a) => a.status === 'diterima' || a.status === 'interview');
  const totalJamPkl = pklLogs.reduce((acc) => acc + 8, 0); // Est 8 jam per log
  const targetJamSekolah = 480; // Standar 3 bulan PKL = 480 jam
  const progressPersen = Math.min(100, Math.round((totalJamPkl / targetJamSekolah) * 100));

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Welcome Banner Khusus Siswa SMA / SMK */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-amber-500 via-orange-500 to-indigo-600 text-white p-6 sm:p-8 shadow-xl shadow-amber-500/10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider mb-3 border border-white/20">
            <School className="w-3.5 h-3.5" />
            <span>POV Siswa SMA / SMK • Praktik Kerja Lapangan (PKL)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Halo, {profile?.nama || currentUser.nama}! 🎒
          </h1>
          <p className="text-amber-50 text-sm sm:text-base leading-relaxed mb-5">
            Selamat datang di portal magang & PKL terpadu. Temukan tempat magang resmi industri dengan bimbingan mentor, jam kerja ramah pelajar, dan upah bulanan transparan untuk mendukung persiapan karir Anda.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('jobs')}
              className="px-4 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs sm:text-sm hover:bg-amber-50 transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-amber-600" />
              <span>Jelajahi Lowongan PKL Siswa</span>
            </button>
            <button
              onClick={() => onNavigate('siswa-logbook')}
              className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs sm:text-sm backdrop-blur-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Isi Logbook Harian</span>
            </button>
          </div>
        </div>

        {/* Decorative Badge Background */}
        <div className="absolute right-4 -bottom-6 opacity-15 hidden lg:block pointer-events-none">
          <School className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* Info Asal Sekolah & NISN Siswa */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-extrabold shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                {profile?.namaSekolah || profile?.universitas || 'SMK Negeri 1 Jakarta'}
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 font-bold">
                {profile?.kelas || 'Kelas XI (11) SMK'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Jurusan: <strong className="text-slate-700 dark:text-slate-300">{profile?.jurusan || 'Rekayasa Perangkat Lunak'}</strong> • NISN: {profile?.nisn || '0061298451'} • Guru: {profile?.guruPembimbing || 'Drs. Bambang Hidayat'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('profile')}
          className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
        >
          <span>Ubah Biodata & Surat PKL</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Lowongan Tersedia */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Lowongan PKL Siswa</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1">
            {siswaJobs.length} Posisi
          </div>
          <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Upah bulanan transparan</span>
          </p>
        </div>

        {/* Stat 2: Lamaran Dikirim */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Lamaran Saya</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1">
            {applications.length} Terkirim
          </div>
          <p className="text-[11px] text-slate-500">
            {acceptedApps.length > 0 ? `${acceptedApps.length} tahap seleksi aktif` : 'Menunggu respon perusahaan'}
          </p>
        </div>

        {/* Stat 3: Jam PKL Terpenuhi */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Jam PKL</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1">
            {totalJamPkl} / {targetJamSekolah} Jam
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPersen}%` }}
            />
          </div>
        </div>

        {/* Stat 4: Catatan Logbook */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Logbook PKL</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1">
            {pklLogs.length} Entri
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">
            {pklLogs.filter((l) => l.statusVerifikasi === 'disetujui').length} disetujui mentor
          </p>
        </div>
      </div>

      {/* PKL Readiness Checklist (Syarat Wajib Siswa PKL) */}
      <div className="bg-linear-to-br from-indigo-50/70 to-amber-50/70 dark:from-indigo-950/30 dark:to-amber-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              ✓
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Kesiapan Berkas Administrasi PKL Siswa
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kelengkapan dokumen standar sebelum mulai bekerja di industri mitra
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Status: Siap Melamar (100%)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800">
            <FileCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Surat Tugas PKL</div>
              <div className="text-[11px] text-slate-500">Dari Kepala Sekolah (Tersedia)</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Izin Orang Tua</div>
              <div className="text-[11px] text-slate-500">Ditandatangani Wali Murid</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Jam Ramah Siswa</div>
              <div className="text-[11px] text-slate-500">Maksimal 8 Jam, Tanpa Lembur</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800">
            <Award className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Sertifikat Industri</div>
              <div className="text-[11px] text-slate-500">Penilaian Nilai Rapor PKL</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Rekomendasi Tempat Magang & Upah Bulanan + Logbook Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Lowongan Rekomendasi Siswa */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Rekomendasi Tempat Magang PKL Siswa & Upah Bulanan
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pilihan tempat magang terverifikasi ramah pelajar SMA / SMK
              </p>
            </div>
            <button
              onClick={() => onNavigate('jobs')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Semua ({siswaJobs.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {siswaJobs.slice(0, 4).map((job) => (
              <div
                key={job.id}
                onClick={() => onNavigate('jobs')}
                className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-3">
                    <img
                      src={job.companyLogo}
                      alt={job.companyName}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-100 dark:border-slate-800 shrink-0"
                    />
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                        {job.judul}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>{job.companyName}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" />
                          {job.lokasi}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Upah Per Bulan Badge */}
                  <KompensasiBadge kompensasi={job.kompensasi} upahNominal={job.upahNominal} />
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3 leading-relaxed">
                  {job.deskripsi}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <TargetJenjangBadge target={job.targetJenjang} />
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium">
                      Durasi: {job.durasi}
                    </span>
                  </div>

                  <span className="text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Detail & Lamar Lowongan →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Logbook PKL Terkini & Aksi Cepat */}
        <div className="space-y-5">
          {/* Widget Logbook Harian */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Logbook Kegiatan PKL
                </h3>
              </div>
              <button
                onClick={() => onNavigate('siswa-logbook')}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
              >
                Buka Logbook
              </button>
            </div>

            {pklLogs.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                Belum ada catatan kegiatan PKL. Mulai catat kegiatan harian Anda!
              </div>
            ) : (
              <div className="space-y-3">
                {pklLogs.slice(0, 3).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {log.tanggal}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          log.statusVerifikasi === 'disetujui'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {log.statusVerifikasi === 'disetujui' ? '✓ Disetujui Mentor' : 'Menunggu Review'}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {log.kegiatan}
                    </p>

                    {log.catatanMentor && (
                      <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[11px] text-emerald-800 dark:text-emerald-300 italic border border-emerald-200/50 dark:border-emerald-900/50">
                        Mentor: &ldquo;{log.catatanMentor}&rdquo;
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => onNavigate('siswa-logbook')}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Catatan PKL Hari Ini</span>
            </button>
          </div>

          {/* Tips Sukses PKL untuk Siswa */}
          <div className="bg-linear-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md">
            <h4 className="font-bold text-xs uppercase tracking-wider text-amber-300 mb-2 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              Tips Sukses PKL Siswa SMA / SMK
            </h4>
            <ul className="text-xs text-slate-200 space-y-2 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-amber-400 font-bold">•</span>
                <span><strong>Datang 15 menit lebih awal:</strong> Disiplin waktu adalah nilai plus utama bagi pembimbing industri.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-400 font-bold">•</span>
                <span><strong>Catat logbook tiap sore:</strong> Minta tanda tangan atau review pembimbing tiap akhir pekan.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-400 font-bold">•</span>
                <span><strong>Jaga etika & sopan santun:</strong> Ucapkan salam, terima kasih, dan jangan ragu bertanya bila kurang jelas.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
