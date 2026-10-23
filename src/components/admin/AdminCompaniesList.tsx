import React, { useState } from 'react';
import { User, CompanyProfile } from '../../types';
import {
  SYSTEM_ADMIN_EMAIL,
  getAllCompanyProfiles,
  getJobs,
  getApplications,
  saveCompanyProfile,
  logActivity,
} from '../../services/storage';
import {
  Building2,
  ShieldCheck,
  Search,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  Briefcase,
  Users,
  MessageSquare,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface AdminCompaniesListProps {
  currentUser: User;
  onNavigateToChats?: () => void;
  onNotify?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminCompaniesList: React.FC<AdminCompaniesListProps> = ({
  currentUser,
  onNavigateToChats,
  onNotify,
}) => {
  if (
    currentUser.email.toLowerCase() !== SYSTEM_ADMIN_EMAIL.toLowerCase() ||
    currentUser.role !== 'admin'
  ) {
    return (
      <div className="p-8 text-center bg-red-50 dark:bg-red-950/30 rounded-3xl border border-red-200 dark:border-red-800">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-red-800 dark:text-red-300">
          Akses Ditolak: Khusus Akun Admin Resmi ({SYSTEM_ADMIN_EMAIL})
        </h2>
      </div>
    );
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('Semua');

  const companiesList: CompanyProfile[] = getAllCompanyProfiles();
  const jobs = getJobs();
  const applications = getApplications();

  const industries = [
    'Semua',
    ...Array.from(new Set(companiesList.map((c) => c.industri))),
  ];

  const filteredCompanies = companiesList.filter((comp) => {
    const matchQuery =
      comp.namaPerusahaan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.kota.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.industri.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.emailKontak.toLowerCase().includes(searchQuery.toLowerCase());

    const matchIndustry =
      selectedIndustry === 'Semua' || comp.industri === selectedIndustry;

    return matchQuery && matchIndustry;
  });

  const handleToggleVerification = (comp: CompanyProfile) => {
    const newStatus =
      comp.statusVerifikasi === 'terverifikasi' ? 'menunggu' : 'terverifikasi';
    const updated: CompanyProfile = {
      ...comp,
      statusVerifikasi: newStatus,
    };
    saveCompanyProfile(updated);

    logActivity({
      userId: currentUser.id,
      userName: currentUser.nama,
      userRole: 'admin',
      action: 'UPDATE_STATUS_VERIFIKASI_MITRA',
      details: `Mengubah status verifikasi ${comp.namaPerusahaan} menjadi ${newStatus.toUpperCase()}`,
    });

    if (onNotify) {
      onNotify(
        `Status ${comp.namaPerusahaan} berhasil diubah menjadi ${newStatus}.`,
        'success'
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="p-5 rounded-3xl bg-linear-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 text-xs font-bold border border-purple-400/30 mb-2">
            <ShieldCheck className="w-4 h-4 text-purple-300" />
            <span>Direktori Lengkap Mitra Perusahaan</span>
          </div>
          <h1 className="text-xl font-black">
            Manajemen & Audit Perusahaan Mitra Terdaftar
          </h1>
          <p className="text-xs text-purple-200/80 mt-1 max-w-xl">
            Kelola data legalitas, status kemitraan, jumlah kuota lowongan aktif, dan pantau langsung riwayat chat perusahaan dengan calon pelamar.
          </p>
        </div>

        {onNavigateToChats && (
          <button
            onClick={onNavigateToChats}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-purple-600/30 transition-all cursor-pointer self-start sm:self-auto"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Buka Monitoring Chat Platform</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari perusahaan (Google, Apple, Samsung, Sony, Gojek, BCA, dll)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200"
          >
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Company Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompanies.map((comp) => {
          const companyJobs = jobs.filter((j) => j.companyId === comp.userId);
          const activeJobsCount = companyJobs.filter((j) => j.status === 'aktif').length;
          const companyJobIds = new Set(companyJobs.map((j) => j.id));
          const applicantCount = applications.filter((a) => companyJobIds.has(a.lowonganId)).length;
          const isVerified = comp.statusVerifikasi === 'terverifikasi';

          return (
            <div
              key={comp.userId}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-all hover:border-purple-300 dark:hover:border-purple-800"
            >
              <div>
                {/* Header: Logo, Name, Verification Badge */}
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={comp.logoUrl}
                    alt={comp.namaPerusahaan}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {comp.namaPerusahaan}
                    </h3>
                    <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{comp.kota}</span>
                    </div>
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-800/40">
                      {comp.industri}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {comp.deskripsi}
                </p>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs mb-4">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Lowongan Aktif</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                      {activeJobsCount} Posisi
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total Pelamar</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-emerald-500" />
                      {applicantCount} Berkas
                    </span>
                  </div>
                </div>

                {/* Contact metadata */}
                <div className="space-y-1.5 text-[11px] text-slate-500 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{comp.emailKontak}</span>
                  </div>
                  {comp.website && (
                    <div className="flex items-center gap-2 truncate">
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a
                        href={comp.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 hover:underline truncate"
                      >
                        {comp.website.replace('https://', '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleVerification(comp)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    isVerified
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {isVerified ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Terverifikasi</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Verifikasi Mitra</span>
                    </>
                  )}
                </button>

                {onNavigateToChats && (
                  <button
                    type="button"
                    onClick={onNavigateToChats}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800/60 flex items-center gap-1 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Audit Chat</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
