import React, { useState } from 'react';
import { User, CompanyProfile, CompanyVerificationStatus } from '../../types';
import {
  getAllCompanyProfiles,
  verifyCompany,
  getUserById,
} from '../../services/storage';
import { CompanyStatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Globe,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  AlertTriangle,
  FileText,
} from 'lucide-react';

interface CompanyVerificationProps {
  currentUser: User;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const CompanyVerification: React.FC<CompanyVerificationProps> = ({
  currentUser,
  onNotify,
}) => {
  const [filterTab, setFilterTab] = useState<'semua' | 'menunggu' | 'terverifikasi' | 'ditolak'>('semua');
  const [selectedCompany, setSelectedCompany] = useState<CompanyProfile | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const profiles = getAllCompanyProfiles();

  const filteredProfiles = profiles.filter((p) => {
    if (filterTab === 'semua') return true;
    return p.statusVerifikasi === filterTab;
  });

  const handleApprove = (company: CompanyProfile) => {
    verifyCompany(company.userId, 'terverifikasi');
    onNotify(`Perusahaan ${company.namaPerusahaan} berhasil diverifikasi!`, 'success');
    if (selectedCompany?.userId === company.userId) {
      setSelectedCompany(null);
    }
  };

  const handleOpenReject = (company: CompanyProfile) => {
    setSelectedCompany(company);
    setRejectReason('Dokumen perizinan/legalitas belum lengkap atau data kontak tidak dapat dihubungi.');
    setShowRejectModal(true);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;

    verifyCompany(selectedCompany.userId, 'ditolak', rejectReason);
    onNotify(`Verifikasi untuk ${selectedCompany.namaPerusahaan} telah ditolak.`, 'info');
    setShowRejectModal(false);
    setSelectedCompany(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Verifikasi Akun Perusahaan Mitra
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Tinjau profil dan validasi izin operasional mitra industri sebelum lowongan mereka dapat dipublikasikan ke mahasiswa
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        {(['semua', 'menunggu', 'terverifikasi', 'ditolak'] as const).map((tab) => {
          const count =
            tab === 'semua'
              ? profiles.length
              : profiles.filter((p) => p.statusVerifikasi === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`pb-3 px-3 text-xs font-bold capitalize transition-all border-b-2 flex items-center gap-1.5 ${
                filterTab === tab
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{tab}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Companies List */}
      {filteredProfiles.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Tidak ada perusahaan dalam status ini
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProfiles.map((company) => {
            const user = getUserById(company.userId);

            return (
              <div
                key={company.userId}
                id={`company-verification-card-${company.userId}`}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          company.logoUrl ||
                          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&auto=format&fit=crop&q=80'
                        }
                        alt={company.namaPerusahaan}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-100 dark:border-slate-800 shrink-0"
                      />
                      <div>
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                          {company.namaPerusahaan}
                        </h3>
                        <p className="text-xs text-slate-500">{company.industri}</p>
                      </div>
                    </div>
                    <CompanyStatusBadge status={company.statusVerifikasi} />
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 mb-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{company.kota} • {company.alamat}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        {company.website}
                      </a>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{company.noTelp} (PIC: {user?.email})</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-3 leading-relaxed">
                    {company.deskripsi}
                  </p>

                  {company.statusVerifikasi === 'ditolak' && company.alasanPenolakan && (
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-300 text-xs mb-3 border border-rose-200 dark:border-rose-900/50">
                      <strong>Alasan Penolakan:</strong> {company.alasanPenolakan}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  {company.statusVerifikasi === 'menunggu' && (
                    <>
                      <button
                        onClick={() => handleOpenReject(company)}
                        className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => handleApprove(company)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verifikasi & Setujui</span>
                      </button>
                    </>
                  )}

                  {company.statusVerifikasi === 'terverifikasi' && (
                    <button
                      onClick={() => handleOpenReject(company)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                    >
                      Cabut Verifikasi
                    </button>
                  )}

                  {company.statusVerifikasi === 'ditolak' && (
                    <button
                      onClick={() => handleApprove(company)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                    >
                      Pulihkan & Verifikasi
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {showRejectModal && selectedCompany && (
        <Modal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          title={`Tolak Verifikasi: ${selectedCompany.namaPerusahaan}`}
          subtitle="Berikan alasan jelas agar perwakilan perusahaan dapat memperbaiki berkasnya"
          maxWidth="md"
        >
          <form onSubmit={handleConfirmReject} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alasan Penolakan Verifikasi *
              </label>
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Konfirmasi Penolakan
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
