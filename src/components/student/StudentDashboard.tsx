import React from 'react';
import { User, JobListing } from '../../types';
import {
  getApplicationsByStudent,
  getBookmarks,
  getJobs,
  getStudentProfile,
} from '../../services/storage';
import { ApplicationStatusBadge, JobTypeBadge } from '../common/Badge';
import {
  FileText,
  Clock,
  CheckCircle2,
  Bookmark,
  Compass,
  ArrowRight,
  Sparkles,
  Building2,
  Award,
  Video,
} from 'lucide-react';

interface StudentDashboardProps {
  currentUser: User;
  onNavigate: (view: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ currentUser, onNavigate }) => {
  const applications = getApplicationsByStudent(currentUser.id);
  const bookmarks = getBookmarks(currentUser.id);
  const jobs = getJobs().filter((j) => j.status === 'aktif');
  const profile = getStudentProfile(currentUser.id);

  const pendingCount = applications.filter((a) => a.status === 'menunggu' || a.status === 'direview').length;
  const interviewCount = applications.filter((a) => a.status === 'interview').length;
  const acceptedCount = applications.filter((a) => a.status === 'diterima').length;

  const interviewApp = applications.find((a) => a.status === 'interview');

  // Recommended jobs (not yet applied)
  const appliedJobIds = new Set(applications.map((a) => a.lowonganId));
  const recommendedJobs = jobs.filter((j) => !appliedJobIds.has(j.id)).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-semibold mb-1.5 border border-emerald-200/60 dark:border-emerald-800">
            <Sparkles className="w-3.5 h-3.5" />
            Dashboard Mahasiswa
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Halo, {currentUser.nama}! 👋
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {profile?.universitas || 'Universitas Indonesia'} • {profile?.jurusan || 'Teknik'} (Semester {profile?.semester || 5})
          </p>
        </div>

        <button
          onClick={() => onNavigate('jobs')}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Compass className="w-4 h-4" />
          <span>Eksplorasi Lowongan</span>
        </button>
      </div>

      {/* Special Notice for Interview */}
      {interviewApp && (
        <div className="p-4 rounded-2xl bg-linear-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs text-purple-300 shrink-0">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Anda Memiliki Jadwal Wawancara!</h3>
              <p className="text-xs text-purple-200 mt-0.5">
                {interviewApp.jadwalInterview || 'Wawancara magang dijadwalkan oleh tim rekrutmen.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('applications')}
            className="px-3.5 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-purple-50 transition-colors shrink-0"
          >
            Lihat Detail
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Lamaran</span>
            <FileText className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {applications.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Lamaran telah diajukan</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Dalam Proses</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{pendingCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Menunggu & Direview</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Tahap Wawancara</span>
            <Video className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{interviewCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Undangan interview aktif</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Diterima Magang</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {acceptedCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Penawaran resmi</p>
        </div>
      </div>

      {/* Two Column Section: Recent Applications & Recommended Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recent Applications */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Status Lamaran Terbaru
            </h3>
            <button
              onClick={() => onNavigate('applications')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {applications.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Belum ada lamaran terkirim. Mulai melamar sekarang!
            </div>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 3).map((app) => (
                <div
                  key={app.id}
                  onClick={() => onNavigate('applications')}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {app.studentMajor}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      Dilamar: {new Date(app.createdAt).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                  <ApplicationStatusBadge status={app.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Recommended Jobs */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Rekomendasi Magang untuk Anda
            </h3>
            <button
              onClick={() => onNavigate('jobs')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Cari Lainnya <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recommendedJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => onNavigate('jobs')}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={job.companyLogo}
                    alt={job.companyName}
                    className="w-9 h-9 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {job.judul}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">{job.companyName}</p>
                  </div>
                </div>
                <JobTypeBadge type={job.tipe} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Riwayat Magang (Completed Internships) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Riwayat Magang Selesai</h3>
              <p className="text-[11px] text-slate-500">Pengalaman magang yang telah berhasil Anda tuntaskan</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('profile')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Kelola di Profil
          </button>
        </div>

        {profile?.completedInternships && profile.completedInternships.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profile.completedInternships.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.posisi}</h4>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40">
                    Selesai
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{item.perusahaan}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{item.periode}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {item.deskripsi}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-slate-400 text-xs">
            Belum ada riwayat magang selesai yang tercatat. Selesaikan program magang pertama Anda melalui InternSpace!
          </div>
        )}
      </div>
    </div>
  );
};
