import React from 'react';
import { ApplicationStatus, CompanyVerificationStatus, JobStatus, JobType, UserRole } from '../../types';

export const ApplicationStatusBadge: React.FC<{ status: ApplicationStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  switch (status) {
    case 'menunggu':
      return (
        <span
          id={`status-badge-menunggu`}
          className={`inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50 ${sizeClasses}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          Menunggu Review
        </span>
      );
    case 'direview':
      return (
        <span
          id={`status-badge-direview`}
          className={`inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50 ${sizeClasses}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
          Sedang Diproses
        </span>
      );
    case 'interview':
      return (
        <span
          id={`status-badge-interview`}
          className={`inline-flex items-center gap-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/50 ${sizeClasses}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
          Tahap Interview
        </span>
      );
    case 'diterima':
      return (
        <span
          id={`status-badge-diterima`}
          className={`inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50 ${sizeClasses}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          Diterima Magang
        </span>
      );
    case 'ditolak':
      return (
        <span
          id={`status-badge-ditolak`}
          className={`inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50 ${sizeClasses}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
          Tidak Lolos
        </span>
      );
    default:
      return null;
  }
};

export const CompanyStatusBadge: React.FC<{ status: CompanyVerificationStatus }> = ({ status }) => {
  switch (status) {
    case 'terverifikasi':
      return (
        <span
          id="company-badge-verified"
          className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50"
        >
          <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Terverifikasi
        </span>
      );
    case 'menunggu':
      return (
        <span
          id="company-badge-pending"
          className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          Menunggu Verifikasi
        </span>
      );
    case 'ditolak':
      return (
        <span
          id="company-badge-rejected"
          className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50"
        >
          Ditolak
        </span>
      );
  }
};

export const JobStatusBadge: React.FC<{ status: JobStatus }> = ({ status }) => {
  switch (status) {
    case 'aktif':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          Aktif
        </span>
      );
    case 'menunggu_moderasi':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          Moderasi
        </span>
      );
    case 'nonaktif':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
          Nonaktif
        </span>
      );
    case 'ditolak':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50">
          Ditolak Admin
        </span>
      );
  }
};

export const JobTypeBadge: React.FC<{ type: JobType }> = ({ type }) => {
  const map: Record<JobType, { label: string; class: string }> = {
    remote: {
      label: 'Remote (WFA)',
      class: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/50',
    },
    hybrid: {
      label: 'Hybrid',
      class: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/50',
    },
    onsite: {
      label: 'On-site',
      class: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    },
  };

  const item = map[type] || map.onsite;

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border ${item.class}`}>
      {item.label}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  switch (role) {
    case 'admin':
      return (
        <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800">
          Admin Sistem
        </span>
      );
    case 'perusahaan':
      return (
        <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800">
          Mitra Perusahaan
        </span>
      );
    case 'mahasiswa':
      return (
        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
          Mahasiswa Pelamar
        </span>
      );
  }
};
