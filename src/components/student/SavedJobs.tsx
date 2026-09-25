import React from 'react';
import { User, JobListing } from '../../types';
import { getBookmarks, getJobs, toggleBookmark } from '../../services/storage';
import { JobTypeBadge, KompensasiBadge, TargetJenjangBadge } from '../common/Badge';
import { Bookmark, MapPin, Clock, ArrowRight, Trash2, Briefcase } from 'lucide-react';

interface SavedJobsProps {
  currentUser: User;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateToJobs: () => void;
}

export const SavedJobs: React.FC<SavedJobsProps> = ({ currentUser, onNotify, onNavigateToJobs }) => {
  const bookmarkIds = getBookmarks(currentUser.id);
  const allJobs = getJobs();
  const savedJobs = allJobs.filter((j) => bookmarkIds.includes(j.id));

  const handleRemove = (jobId: string) => {
    toggleBookmark(currentUser.id, jobId);
    onNotify('Lowongan dihapus dari daftar simpanan.', 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Lowongan Disimpan ({savedJobs.length})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Daftar lowongan magang yang Anda tandai untuk dilamar di kemudian hari
          </p>
        </div>

        <button
          onClick={onNavigateToJobs}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
        >
          Cari Lowongan Lainnya
        </button>
      </div>

      {savedJobs.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Bookmark className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Belum ada lowongan yang disimpan
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Klik ikon bookmark pada kartu lowongan di halaman Cari Magang untuk menyimpannya di sini.
          </p>
          <button
            onClick={onNavigateToJobs}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
          >
            Jelajahi Lowongan Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={job.companyLogo}
                      alt={job.companyName}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-100 dark:border-slate-800 shrink-0"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                        {job.companyName}
                      </h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {job.lokasi}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemove(job.id)}
                    title="Hapus dari simpanan"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">
                  {job.judul}
                </h3>

                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  <TargetJenjangBadge target={job.targetJenjang} />
                  <JobTypeBadge type={job.tipe} />
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {job.durasi}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {job.deskripsi}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <KompensasiBadge kompensasi={job.kompensasi} upahNominal={job.upahNominal} />

                <button
                  onClick={onNavigateToJobs}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Buka & Lamar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
