import React, { useState } from 'react';
import { User, CompanyProfile } from '../../types';
import { getCompanyProfile, saveCompanyProfile } from '../../services/storage';
import { CompanyStatusBadge } from '../common/Badge';
import {
  Building2,
  Globe,
  MapPin,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface CompanyProfileViewProps {
  currentUser: User;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const CompanyProfileView: React.FC<CompanyProfileViewProps> = ({ currentUser, onNotify }) => {
  const existingProfile = getCompanyProfile(currentUser.id);

  const [namaPerusahaan, setNamaPerusahaan] = useState(
    existingProfile?.namaPerusahaan || currentUser.nama
  );
  const [industri, setIndustri] = useState(existingProfile?.industri || 'Teknologi Informasi & Finansial');
  const [kota, setKota] = useState(existingProfile?.kota || 'Jakarta Selatan');
  const [alamat, setAlamat] = useState(
    existingProfile?.alamat || 'Gedung Cyber 2, Lt. 18, Jl. H.R. Rasuna Said Blok X-5, Kuningan'
  );
  const [website, setWebsite] = useState(existingProfile?.website || 'https://perusahaan.co.id');
  const [noTelp, setNoTelp] = useState(existingProfile?.noTelp || '021-50820000');
  const [deskripsi, setDeskripsi] = useState(
    existingProfile?.deskripsi ||
      'Perusahaan teknologi yang berfokus pada inovasi digital, transformasi perbankan modern, dan inkubasi talenta muda Indonesia.'
  );
  const [logoUrl, setLogoUrl] = useState(
    existingProfile?.logoUrl ||
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&auto=format&fit=crop&q=80'
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPerusahaan.trim()) {
      onNotify('Nama perusahaan wajib diisi.', 'error');
      return;
    }

    const updated: CompanyProfile = {
      userId: currentUser.id,
      namaPerusahaan,
      logoUrl,
      industri,
      kota,
      alamat,
      website,
      deskripsi,
      noTelp,
      noTelepon: noTelp,
      statusVerifikasi: existingProfile?.statusVerifikasi || 'menunggu',
      alasanPenolakan: existingProfile?.alasanPenolakan,
      createdAt: existingProfile?.createdAt || new Date().toISOString(),
    };

    saveCompanyProfile(updated);
    onNotify('Profil mitra perusahaan berhasil diperbarui!', 'success');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Profil Perusahaan & Legalitas
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Data ini akan ditampilkan pada setiap pengumuman lowongan magang yang Anda publikasikan
          </p>
        </div>

        {existingProfile && (
          <div className="self-start sm:self-auto">
            <CompanyStatusBadge status={existingProfile.statusVerifikasi} />
          </div>
        )}
      </div>

      {/* Verification Details Callout */}
      {existingProfile?.statusVerifikasi === 'terverifikasi' && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <span className="font-bold">Mitra Resmi Terverifikasi</span>
            <p className="text-emerald-800 dark:text-emerald-300 mt-0.5">
              Akun Anda telah lolos uji kelayakan oleh tim Admin InternSpace. Lowongan Anda langsung tayang dan dapat dilamar oleh mahasiswa.
            </p>
          </div>
        </div>
      )}

      {existingProfile?.statusVerifikasi === 'menunggu' && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <span className="font-bold">Verifikasi Sedang Berjalan</span>
            <p className="text-amber-800 dark:text-amber-300 mt-0.5">
              Admin sedang meninjau dokumen perusahaan Anda. Hubungi dukungan jika proses memakan waktu lebih dari 1x24 jam.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-slate-100 dark:border-slate-800">
          <img
            src={logoUrl}
            alt={namaPerusahaan}
            className="w-20 h-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
          />
          <div className="flex-1 w-full space-y-2 text-xs">
            <label className="block font-semibold text-slate-700 dark:text-slate-300">
              URL Logo Perusahaan
            </label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
            />
            <p className="text-[11px] text-slate-400">
              Gunakan tautan gambar PNG/JPG rasio 1:1 untuk hasil optimal.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Resmi Perusahaan *
            </label>
            <input
              type="text"
              required
              value={namaPerusahaan}
              onChange={(e) => setNamaPerusahaan(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Sektor / Industri *
            </label>
            <input
              type="text"
              required
              value={industri}
              onChange={(e) => setIndustri(e.target.value)}
              placeholder="e.g. Fintech, E-Commerce, Kreatif"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Kota Kantor Pusat / Domisili *
            </label>
            <input
              type="text"
              required
              value={kota}
              onChange={(e) => setKota(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nomor Telepon Kantor *
            </label>
            <input
              type="text"
              required
              value={noTelp}
              onChange={(e) => setNoTelp(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Situs Web Perusahaan
          </label>
          <div className="relative">
            <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://perusahaan.co.id"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Alamat Lengkap Kantor
          </label>
          <input
            type="text"
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Tentang Perusahaan & Budaya Kerja
          </label>
          <textarea
            rows={4}
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            id="btn-save-company-profile"
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Simpan Informasi Perusahaan</span>
          </button>
        </div>
      </form>
    </div>
  );
};
