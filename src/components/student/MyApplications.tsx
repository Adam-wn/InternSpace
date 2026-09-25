import React, { useState } from 'react';
import { User, Application, ApplicationStatus, JobListing } from '../../types';
import {
  getApplicationsByStudent,
  getJobById,
  deleteJob,
  getApplications,
} from '../../services/storage';
import { ApplicationStatusBadge, JobTypeBadge } from '../common/Badge';
import {
  FileText,
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Video,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface MyApplicationsProps {
  currentUser: User;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateToJobs: () => void;
}

export const MyApplications: React.FC<MyApplicationsProps> = ({
  currentUser,
  onNotify,
  onNavigateToJobs,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('semua');
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);

  const applications = getApplicationsByStudent(currentUser.id);

  const statusFilters = [
    { key: 'semua', label: 'Semua Status', count: applications.length },
    { key: 'menunggu', label: 'Menunggu', count: applications.filter((a) => a.status === 'menunggu').length },
    { key: 'direview', label: 'Diproses', count: applications.filter((a) => a.status === 'direview').length },
    { key: 'interview', label: 'Interview', count: applications.filter((a) => a.status === 'interview').length },
    { key: 'diterima', label: 'Diterima', count: applications.filter((a) => a.status === 'diterima').length },
    { key: 'ditolak', label: 'Tidak Lolos', count: applications.filter((a) => a.status === 'ditolak').length },
  ];

  const filteredApplications = applications.filter((app) => {
    if (selectedStatus === 'semua') return true;
    return app.status === selectedStatus;
  });

  const toggleExpand = (appId: string) => {
    setExpandedAppId(expandedAppId === appId ? null : appId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Lamaran Saya
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pantau status seleksi magang dan jadwal wawancara dari perusahaan mitra
          </p>
        </div>

        <button
          onClick={onNavigateToJobs}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
        >
          Cari Lowongan Lainnya
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        {statusFilters.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedStatus(tab.key)}
            className={`pb-3 px-3 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5 ${
              selectedStatus === tab.key
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedStatus === tab.key
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Tidak ada lamaran pada status ini
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Jelajahi lowongan yang sesuai dengan keahlian dan minat Anda untuk memulai magang.
          </p>
          <button
            onClick={onNavigateToJobs}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
          >
            Eksplorasi Lowongan Sekarang
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const job = getJobById(app.lowonganId);
            const isExpanded = expandedAppId === app.id;

            return (
              <div
                key={app.id}
                id={`application-item-${app.id}`}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={
                        job?.companyLogo ||
                        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&auto=format&fit=crop&q=80'
                      }
                      alt={job?.companyName || 'Perusahaan'}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-100 dark:border-slate-800 shrink-0"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                        {job?.judul || 'Lowongan Magang'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {job?.companyName || 'Perusahaan Mitra'} • Dilamar pada{' '}
                        {new Date(app.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <ApplicationStatusBadge status={app.status} size="md" />
                  </div>
                </div>

                {/* Interview Notice Alert Box if status === 'interview' */}
                {app.status === 'interview' && (
                  <div className="mb-3 p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 text-xs">
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <Video className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      Jadwal Undangan Wawancara:
                    </div>
                    <p className="font-semibold text-purple-950 dark:text-purple-100">
                      {app.jadwalInterview || 'Senin, 17 Maret 2025 pukul 10:00 WIB via Google Meet'}
                    </p>
                    <p className="text-[11px] text-purple-700 dark:text-purple-300 mt-1">
                      Pastikan koneksi internet stabil dan siapkan portofolio Anda sebelum sesi wawancara dimulai.
                    </p>
                  </div>
                )}

                {/* Accepted Congratulations Banner */}
                {app.status === 'diterima' && (
                  <div className="mb-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Selamat! Anda Resmi Diterima Magang</p>
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5">
                        Tim HR telah menyetujui lamaran Anda. Cek kotak masuk email ({app.studentEmail}) untuk konfirmasi Offering Letter dan jadwal onboarding.
                      </p>
                    </div>
                  </div>
                )}

                {/* Internal HR Note if exists */}
                {app.catatanInternal && (
                  <div className="mb-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                      Catatan dari HR Perusahaan:
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 italic">
                      "{app.catatanInternal}"
                    </p>
                  </div>
                )}

                {/* Accordion Toggle for motivation letter & details */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-slate-500">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      {app.cvFileName || 'CV_Mahasiswa.pdf'}
                    </span>
                    {app.portfolioLink && (
                      <a
                        href={app.portfolioLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        Portofolio <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => toggleExpand(app.id)}
                    className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold flex items-center gap-1 py-1"
                  >
                    <span>{isExpanded ? 'Sembunyikan Surat' : 'Lihat Surat Motivasi'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                    <h5 className="font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Surat Motivasi yang Anda Kirim:
                    </h5>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {app.motivationLetter}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
