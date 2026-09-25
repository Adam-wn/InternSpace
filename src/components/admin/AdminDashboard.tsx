import React from 'react';
import { User } from '../../types';
import {
  getUsers,
  getJobs,
  getApplications,
  getAllCompanyProfiles,
  getActivityLogs,
} from '../../services/storage';
import {
  Users,
  Building2,
  Briefcase,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Activity,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
  onNavigate: (view: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onNavigate }) => {
  const users = getUsers();
  const jobs = getJobs();
  const applications = getApplications();
  const companyProfiles = getAllCompanyProfiles();
  const logs = getActivityLogs();

  const students = users.filter((u) => u.role === 'mahasiswa');
  const companies = users.filter((u) => u.role === 'perusahaan');

  const pendingCompanies = companyProfiles.filter((c) => c.statusVerifikasi === 'menunggu');
  const activeJobs = jobs.filter((j) => j.status === 'aktif');
  const pendingJobs = jobs.filter((j) => j.status === 'menunggu_moderasi');
  const acceptedApplications = applications.filter((a) => a.status === 'diterima');

  const acceptanceRate = applications.length > 0
    ? Math.round((acceptedApplications.length / applications.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-400/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            Pusat Kendali Pengawas Platform
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Dashboard Utama Administrator
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Pantau seluruh ekosistem magang, verifikasi kredensial mitra perusahaan, moderasi konten lowongan, dan kelola integritas data.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {pendingCompanies.length > 0 && (
            <button
              onClick={() => onNavigate('admin-verify')}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md transition-colors flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{pendingCompanies.length} Butuh Verifikasi</span>
            </button>
          )}
        </div>
      </div>

      {/* Global Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Mahasiswa</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {students.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Pencari magang aktif</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Mitra Perusahaan</span>
            <Building2 className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {companies.length}
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
            {pendingCompanies.length} menunggu review
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Lowongan Magang</span>
            <Briefcase className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{jobs.length}</div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            {activeJobs.length} posisi aktif tayang
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Lamaran</span>
            <FileText className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {applications.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Rasio lolos: {acceptanceRate}%</p>
        </div>
      </div>

      {/* Moderation Alerts & Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Action Items Pending Review */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">
            Tindakan Menunggu Persetujuan Admin
          </h3>

          <div className="space-y-3">
            <div
              onClick={() => onNavigate('admin-verify')}
              className="p-4 rounded-xl border border-amber-200/80 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20 flex items-center justify-between gap-3 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Verifikasi Akun Perusahaan Baru
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {pendingCompanies.length} perusahaan menunggu validasi berkas legalitas
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-600" />
            </div>

            <div
              onClick={() => onNavigate('admin-jobs')}
              className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Moderasi Konten Lowongan
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Awasi kepatuhan lowongan, syarat kompetensi, dan perlindungan peserta magang
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-indigo-600" />
            </div>

            <div
              onClick={() => onNavigate('admin-users')}
              className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Kelola Status Pengguna & Keamanan
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Blokir atau aktifkan kembali akun yang melanggar ketentuan layanan
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-sky-600" />
            </div>
          </div>
        </div>

        {/* Right: Recent Activity Audit Stream */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Log Audit Aktivitas Terkini
            </h3>
            <button
              onClick={() => onNavigate('admin-logs')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Semua Log <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {logs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-start gap-3 text-xs"
              >
                <div className="p-1.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
