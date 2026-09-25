import React, { useState } from 'react';
import { User, JobListing, JobStatus } from '../../types';
import { getJobs, saveJob, deleteJob } from '../../services/storage';
import { JobStatusBadge, JobTypeBadge } from '../common/Badge';
import {
  Briefcase,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trash2,
  Eye,
  ShieldCheck,
  Building2,
} from 'lucide-react';

interface JobModerationProps {
  currentUser: User;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const JobModeration: React.FC<JobModerationProps> = ({ currentUser, onNotify }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'semua' | 'aktif' | 'menunggu_moderasi' | 'nonaktif'>('semua');

  const jobs = getJobs();

  const filteredJobs = jobs.filter((job) => {
    const matchSearch =
      job.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.kategori.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus = statusFilter === 'semua' || job.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const handleUpdateStatus = (job: JobListing, status: JobStatus) => {
    const updated: JobListing = { ...job, status };
    saveJob(updated);
    onNotify(`Status lowongan "${job.judul}" diubah menjadi ${status.toUpperCase()}.`, 'success');
  };

  const handleDelete = (job: JobListing) => {
    if (window.confirm(`Hapus permanen lowongan "${job.judul}" dari ${job.companyName}?`)) {
      deleteJob(job.id);
      onNotify('Lowongan telah dihapus dari sistem oleh Admin.', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Moderasi Lowongan Magang
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Awasi kualitas lowongan, pastikan transparansi kompensasi, dan tindak lanjuti postingan magang yang tidak sesuai ketentuan
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari lowongan, perusahaan, atau kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['semua', 'aktif', 'menunggu_moderasi', 'nonaktif'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="space-y-3">
        {filteredJobs.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            Tidak ada lowongan ditemukan.
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <img
                  src={job.companyLogo}
                  alt={job.companyName}
                  className="w-11 h-11 rounded-xl object-cover border border-slate-100 dark:border-slate-800 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm truncate">
                      {job.judul}
                    </h3>
                    <JobStatusBadge status={job.status} />
                    <JobTypeBadge type={job.tipe} />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {job.companyName} • {job.kategori} • Kuota: {job.kuota} orang • Deadline:{' '}
                    {new Date(job.deadline).toLocaleDateString('id-ID')}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">{job.deskripsi}</p>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                {job.status !== 'aktif' && (
                  <button
                    onClick={() => handleUpdateStatus(job, 'aktif')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Setujui / Aktifkan</span>
                  </button>
                )}

                {job.status === 'aktif' && (
                  <button
                    onClick={() => handleUpdateStatus(job, 'nonaktif')}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 text-xs font-semibold"
                  >
                    Nonaktifkan
                  </button>
                )}

                <button
                  onClick={() => handleDelete(job)}
                  title="Hapus Lowongan"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
