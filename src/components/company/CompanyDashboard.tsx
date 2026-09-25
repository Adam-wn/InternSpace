import React from 'react';
import { User, Application, JobListing } from '../../types';
import {
  getCompanyProfile,
  getJobsByCompany,
  getApplicationsByCompany,
} from '../../services/storage';
import { ApplicationStatusBadge, CompanyStatusBadge, JobTypeBadge } from '../common/Badge';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  ShieldAlert,
  Building2,
  Sparkles,
} from 'lucide-react';

interface CompanyDashboardProps {
  currentUser: User;
  onNavigate: (view: string) => void;
}

export const CompanyDashboard: React.FC<CompanyDashboardProps> = ({ currentUser, onNavigate }) => {
  const profile = getCompanyProfile(currentUser.id);
  const jobs = getJobsByCompany(currentUser.id);
  const applicants = getApplicationsByCompany(currentUser.id);

  const activeJobsCount = jobs.filter((j) => j.status === 'aktif').length;
  const pendingApplicantsCount = applicants.filter((a) => a.status === 'menunggu' || a.status === 'direview').length;
  const interviewCount = applicants.filter((a) => a.status === 'interview').length;
  const acceptedCount = applicants.filter((a) => a.status === 'diterima').length;

  const isVerified = profile?.statusVerifikasi === 'terverifikasi';

  return (
    <div className="space-y-6">
      {/* Verification Status Banner */}
      {profile?.statusVerifikasi === 'menunggu' && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Profil Perusahaan Sedang Menunggu Verifikasi Admin</span>
            <p className="text-amber-800 dark:text-amber-300 mt-0.5">
              Tim admin InternSpace sedang memvalidasi data legalitas perusahaan Anda. Lowongan baru yang Anda buat akan tayang setelah akun terverifikasi.
            </p>
          </div>
        </div>
      )}

      {profile?.statusVerifikasi === 'ditolak' && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Verifikasi Akun Ditolak oleh Admin</span>
            <p className="text-rose-800 dark:text-rose-300 mt-0.5">
              Alasan: {profile.alasanPenolakan || 'Data profil perusahaan belum sesuai standar operasional.'}. Silakan perbarui data di halaman Profil Perusahaan.
            </p>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-4">
          <img
            src={
              profile?.logoUrl ||
              'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&auto=format&fit=crop&q=80'
            }
            alt={profile?.namaPerusahaan || 'Perusahaan'}
            className="w-14 h-14 rounded-2xl object-cover border border-slate-100 dark:border-slate-800 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {profile?.namaPerusahaan || currentUser.nama}
              </h1>
              {profile && <CompanyStatusBadge status={profile.statusVerifikasi} />}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {profile?.industri || 'Mitra Industri'} • {profile?.kota || 'Indonesia'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('company-jobs')}
          id="btn-add-job-cta"
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Lowongan Baru</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Lowongan Aktif</span>
            <Briefcase className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {activeJobsCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Dari total {jobs.length} lowongan</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Pelamar Masuk</span>
            <Users className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {applicants.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Total berkas lamaran</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Tahap Wawancara</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
            {interviewCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Kandidat sedang interview</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Kandidat Diterima</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {acceptedCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Siap menjalani magang</p>
        </div>
      </div>

      {/* Two Columns: Recent Applicants & Quick Job Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recent Applicants */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Pelamar Masuk Terbaru
            </h3>
            <button
              onClick={() => onNavigate('company-applicants')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Lihat Semua ({applicants.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {applicants.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Belum ada pelamar masuk untuk lowongan Anda.
            </div>
          ) : (
            <div className="space-y-3">
              {applicants.slice(0, 4).map((app) => (
                <div
                  key={app.id}
                  onClick={() => onNavigate('company-applicants')}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        app.studentAvatar ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                      }
                      alt={app.studentName}
                      className="w-9 h-9 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {app.studentName}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        {app.studentUniversity} • {app.studentMajor}
                      </p>
                    </div>
                  </div>
                  <ApplicationStatusBadge status={app.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Active Jobs Overview */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Lowongan yang Sedang Tayang
            </h3>
            <button
              onClick={() => onNavigate('company-jobs')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Kelola Lowongan <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {jobs.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Anda belum membuka lowongan magang. Buat lowongan pertama Anda sekarang!
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.slice(0, 3).map((job) => {
                const jobApplicants = applicants.filter((a) => a.lowonganId === job.id);
                return (
                  <div
                    key={job.id}
                    onClick={() => onNavigate('company-jobs')}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {job.judul}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {job.durasi} • Kuota: {job.kuota} orang • Deadline:{' '}
                        {new Date(job.deadline).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-xs font-bold shrink-0">
                      {jobApplicants.length} Pelamar
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
