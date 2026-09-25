import React, { useState, useMemo } from 'react';
import { JobListing, User, Application } from '../../types';
import {
  getJobs,
  getBookmarks,
  toggleBookmark,
  getApplicationsByStudent,
  submitApplication,
  getStudentProfile,
} from '../../services/storage';
import { JobTypeBadge, JobStatusBadge, TargetJenjangBadge, KompensasiBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  Search,
  MapPin,
  Clock,
  Users,
  Calendar,
  Bookmark,
  Briefcase,
  Building2,
  CheckCircle2,
  FileText,
  UploadCloud,
  ChevronRight,
  Filter,
  Sparkles,
  School,
  Coins,
  GraduationCap,
  ShieldCheck,
  Award,
} from 'lucide-react';

interface JobsExplorerProps {
  currentUser: User | null;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateToAuth: () => void;
}

export const JobsExplorer: React.FC<JobsExplorerProps> = ({
  currentUser,
  onNotify,
  onNavigateToAuth,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedType, setSelectedType] = useState('Semua');
  const [selectedDuration, setSelectedDuration] = useState('Semua');
  const [selectedLocation, setSelectedLocation] = useState('Semua');
  const [selectedJenjang, setSelectedJenjang] = useState<'Semua' | 'siswa_sma' | 'mahasiswa'>('Semua');
  const [selectedUpahRange, setSelectedUpahRange] = useState<'Semua' | 'dibawah_2jt' | '2jt_3jt' | 'diatas_3jt'>('Semua');

  // Selected job for detail view
  const [detailJob, setDetailJob] = useState<JobListing | null>(null);

  // Apply modal state
  const [applyJob, setApplyJob] = useState<JobListing | null>(null);
  const [motivationLetter, setMotivationLetter] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [cvSource, setCvSource] = useState<'profile' | 'upload'>('profile');
  const [uploadedCvName, setUploadedCvName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const jobs = getJobs();
  const isStudentRole = currentUser && (currentUser.role === 'mahasiswa' || currentUser.role === 'siswa_sma');
  const studentBookmarks = isStudentRole ? getBookmarks(currentUser.id) : [];
  const studentApplications = isStudentRole ? getApplicationsByStudent(currentUser.id) : [];
  const studentProfile = isStudentRole ? getStudentProfile(currentUser.id) : null;

  // Filter only active jobs for explorer
  const activeJobs = useMemo(() => {
    return jobs.filter((job) => job.status === 'aktif');
  }, [jobs]);

  // Categories list with varied industries
  const categories = [
    'Semua',
    'IT & Software',
    'Retail & Supermarket Modern',
    'Perhotelan & Pariwisata',
    'Otomotif & Servis Kendaraan',
    'Farmasi & Pelayanan Kesehatan',
    'Akuntansi & Perpajakan',
    'Percetakan & Desain Grafis DKV',
    'Pemerintahan & Layanan Publik',
    'Food & Beverage / Kuliner',
    'Telekomunikasi & Jaringan',
    'Penerbitan & Toko Buku Ritel',
    'Pertanian Modern & Agribisnis',
    'Data & Analytics',
    'Design & Creative',
    'Finance & Banking',
  ];

  // Filtered jobs with jenjang and upah range
  const filteredJobs = useMemo(() => {
    return activeJobs.filter((job) => {
      const matchSearch =
        job.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.kompensasi && job.kompensasi.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = selectedCategory === 'Semua' || job.kategori === selectedCategory;
      const matchType = selectedType === 'Semua' || job.tipe.toLowerCase() === selectedType.toLowerCase();
      const matchDuration = selectedDuration === 'Semua' || job.durasi.toLowerCase().includes(selectedDuration.toLowerCase());
      const matchLocation =
        selectedLocation === 'Semua' ||
        (selectedLocation === 'Remote' && job.tipe === 'remote') ||
        job.lokasi.toLowerCase().includes(selectedLocation.toLowerCase());

      // Match Jenjang
      const matchJenjang =
        selectedJenjang === 'Semua' ||
        job.targetJenjang === 'semua' ||
        job.targetJenjang === selectedJenjang;

      // Match Upah Nominal per bulan
      const nominal = job.upahNominal || 0;
      let matchUpah = true;
      if (selectedUpahRange === 'dibawah_2jt') {
        matchUpah = nominal > 0 && nominal <= 2000000;
      } else if (selectedUpahRange === '2jt_3jt') {
        matchUpah = nominal >= 2000000 && nominal <= 3000000;
      } else if (selectedUpahRange === 'diatas_3jt') {
        matchUpah = nominal > 3000000;
      }

      return matchSearch && matchCategory && matchType && matchDuration && matchLocation && matchJenjang && matchUpah;
    });
  }, [activeJobs, searchQuery, selectedCategory, selectedType, selectedDuration, selectedLocation, selectedJenjang, selectedUpahRange]);

  const handleToggleBookmark = (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    if (!currentUser) {
      onNotify('Silakan login terlebih dahulu untuk menyimpan lowongan.', 'info');
      onNavigateToAuth();
      return;
    }
    const isNowBookmarked = toggleBookmark(currentUser.id, jobId);
    onNotify(isNowBookmarked ? 'Lowongan disimpan ke Wishlist.' : 'Lowongan dihapus dari Wishlist.', 'info');
  };

  const hasApplied = (jobId: string) => {
    return studentApplications.some((app) => app.lowonganId === jobId);
  };

  const handleOpenApplyModal = (job: JobListing) => {
    if (!currentUser) {
      onNotify('Silakan login terlebih dahulu untuk melamar lowongan ini.', 'info');
      onNavigateToAuth();
      return;
    }
    if (currentUser.role !== 'mahasiswa' && currentUser.role !== 'siswa_sma') {
      onNotify('Hanya akun Siswa SMA/SMK atau Mahasiswa yang dapat mengajukan lamaran magang.', 'error');
      return;
    }
    if (hasApplied(job.id)) {
      onNotify('Anda sudah mengajukan lamaran untuk posisi ini.', 'info');
      return;
    }

    setApplyJob(job);
    const rolePrefix = currentUser.role === 'siswa_sma' ? 'Sebagai siswa SMA/SMK yang sedang mempersiapkan PKL' : 'Sebagai mahasiswa yang berdedikasi';
    setMotivationLetter(
      `${rolePrefix}, saya sangat tertarik dengan posisi ${job.judul} di ${job.companyName}. Saya siap berkomitmen penuh untuk belajar, disiplin bekerja, dan memberikan kontribusi terbaik.`
    );
    setPortfolioLink(studentProfile?.portfolioUrl || '');
    setCvSource('profile');
    setUploadedCvName('');
  };

  const handleCvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        onNotify('Ukuran file maksimal 5 MB.', 'error');
        return;
      }
      setUploadedCvName(file.name);
      setCvSource('upload');
      onNotify(`File CV "${file.name}" siap dilampirkan.`, 'success');
    }
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyJob || !currentUser) return;

    if (!motivationLetter.trim()) {
      onNotify('Harap isi surat motivasi singkat Anda.', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = submitApplication({
        lowonganId: applyJob.id,
        studentId: currentUser.id,
        motivationLetter,
        portfolioLink,
        cvFileName:
          cvSource === 'upload' && uploadedCvName
            ? uploadedCvName
            : studentProfile?.cvFileName || (currentUser.role === 'siswa_sma' ? 'CV_PKL_Siswa.pdf' : 'CV_Mahasiswa.pdf'),
        cvUrl: 'https://example.com/cv-internspace.pdf',
      });

      setIsSubmitting(false);
      if (res.success) {
        onNotify(`Lamaran berhasil dikirim untuk posisi ${applyJob.judul}!`, 'success');
        setApplyJob(null);
        if (detailJob?.id === applyJob.id) {
          setDetailJob(null);
        }
      } else {
        onNotify(res.error || 'Gagal mengirimkan lamaran.', 'error');
      }
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-indigo-900 via-indigo-800 to-amber-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-amber-200 backdrop-blur-xs mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Eksplorasi Tempat Magang & PKL Resmi
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            Temukan Magang Terbaik dengan Upah Bulanan Transparan
          </h1>
          <p className="mt-2 text-sm text-indigo-100/90 leading-relaxed">
            Terhubung langsung dengan perusahaan mitra terverifikasi di berbagai bidang industri: IT & Software, Retail, Perhotelan, Otomotif, Farmasi, Akuntansi, Kuliner, dan Pemerintahan.
          </p>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200 dark:border-slate-800 space-y-4">
        {/* Main Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            id="job-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari posisi magang, perusahaan (Indomaret, Auto2000, TekNusa, Bank Mandiri...), upah, atau kota..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
          />
        </div>

        {/* Filter Quick Switches: Jenjang Pendidikan & Upah Bulanan */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Jenjang Switcher */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
              <School className="w-3.5 h-3.5 text-indigo-500" />
              Target Jenjang:
            </span>
            <button
              onClick={() => setSelectedJenjang('Semua')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedJenjang === 'Semua'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Semua Jenjang
            </button>
            <button
              onClick={() => setSelectedJenjang('siswa_sma')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedJenjang === 'siswa_sma'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
              }`}
            >
              <span>🎒 Khusus Siswa SMA / SMK (PKL)</span>
            </button>
            <button
              onClick={() => setSelectedJenjang('mahasiswa')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedJenjang === 'mahasiswa'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              <span>🎓 Mahasiswa (D3 / S1)</span>
            </button>
          </div>

          {/* Upah Per Bulan Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-emerald-500" />
              Upah Bulanan:
            </span>
            <select
              value={selectedUpahRange}
              onChange={(e) => setSelectedUpahRange(e.target.value as any)}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="Semua">Semua Kisaran Upah</option>
              <option value="dibawah_2jt">Di Bawah / s.d Rp 2 Jt/bln</option>
              <option value="2jt_3jt">Rp 2.000.000 - Rp 3.000.000 / bln</option>
              <option value="diatas_3jt">&gt; Rp 3.000.000 / bln</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Multi-Filter Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              Tipe Kerja
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="Semua">Semua Tipe</option>
              <option value="remote">Remote (WFA)</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site (Kantor / Toko)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              Durasi Magang
            </label>
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="Semua">Semua Durasi</option>
              <option value="3 Bulan">3 Bulan (Standar PKL)</option>
              <option value="6 Bulan">6 Bulan (Semester Magang)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              Lokasi / Kota
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="Semua">Semua Lokasi</option>
              <option value="Jakarta">DKI Jakarta</option>
              <option value="Tangerang">Tangerang / BSD</option>
              <option value="Bandung">Bandung</option>
              <option value="Bogor">Bogor</option>
              <option value="Bekasi">Bekasi</option>
              <option value="Remote">Remote Only</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Semua');
                setSelectedType('Semua');
                setSelectedDuration('Semua');
                setSelectedLocation('Semua');
                setSelectedJenjang('Semua');
                setSelectedUpahRange('Semua');
              }}
              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors cursor-pointer"
            >
              Reset Semua Filter
            </button>
          </div>
        </div>
      </div>

      {/* JOBS COUNT & LIST */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Lowongan Magang & PKL Tersedia</span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 text-xs font-extrabold border border-indigo-200 dark:border-indigo-800">
              {filteredJobs.length} Lowongan
            </span>
          </h2>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Menampilkan lowongan resmi dengan upah per bulan jelas
          </span>
        </div>

        {filteredJobs.length === 0 ? (
          /* EMPTY STATE */
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Belum ada lowongan yang sesuai kriteria pencarian
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Coba reset filter jenjang atau kategori untuk melihat peluang magang menarik lainnya.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Semua');
                setSelectedType('Semua');
                setSelectedLocation('Semua');
                setSelectedJenjang('Semua');
                setSelectedUpahRange('Semua');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer"
            >
              Tampilkan Semua Lowongan
            </button>
          </div>
        ) : (
          /* JOB CARDS GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs.map((job) => {
              const bookmarked = studentBookmarks.includes(job.id);
              const alreadyApplied = hasApplied(job.id);

              return (
                <div
                  key={job.id}
                  id={`job-card-${job.id}`}
                  onClick={() => setDetailJob(job)}
                  className="group relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Company & Bookmark */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={job.companyLogo}
                          alt={job.companyName}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-100 dark:border-slate-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[210px]">
                            {job.companyName}
                          </h4>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {job.lokasi}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleToggleBookmark(e, job.id)}
                        id={`bookmark-btn-${job.id}`}
                        title={bookmarked ? 'Hapus Simpanan' : 'Simpan Lowongan'}
                        className={`p-2 rounded-xl transition-colors cursor-pointer ${
                          bookmarked
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Job Title */}
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 mb-2">
                      {job.judul}
                    </h3>

                    {/* Badges: Jenjang + Upah Bulanan Prominent */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <TargetJenjangBadge target={job.targetJenjang} />
                      <KompensasiBadge kompensasi={job.kompensasi} upahNominal={job.upahNominal} />
                    </div>

                    {/* Secondary Specs */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[11px] text-slate-500">
                      <JobTypeBadge type={job.tipe} />
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {job.durasi}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                        <Users className="w-3 h-3 text-slate-400" />
                        {job.kuota} Kuota
                      </span>
                      {job.jamKerja && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                          {job.jamKerja}
                        </span>
                      )}
                    </div>

                    {/* Description snippet */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                      {job.deskripsi}
                    </p>
                  </div>

                  {/* Bottom Row: Stipend & Action Button */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span>Upah:</span>
                      <span>{job.kompensasi || 'Uang Saku'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {alreadyApplied ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Sudah Dilamar
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenApplyModal(job);
                          }}
                          id={`apply-quick-btn-${job.id}`}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>Lamar</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DETAIL JOB MODAL */}
      {detailJob && (
        <Modal
          isOpen={!!detailJob}
          onClose={() => setDetailJob(null)}
          title={detailJob.judul}
          subtitle={`${detailJob.companyName} • ${detailJob.lokasi}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Target Jenjang & Upah Bulanan Banner */}
            <div className="p-4 rounded-2xl bg-linear-to-r from-emerald-50 to-indigo-50 dark:from-emerald-950/40 dark:to-indigo-950/30 border border-emerald-200 dark:border-emerald-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Upah & Tunjangan Bulanan:
                </div>
                <div className="text-lg font-black text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <span>💰</span>
                  <span>{detailJob.kompensasi || 'Uang Saku + Transport'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TargetJenjangBadge target={detailJob.targetJenjang} />
                <JobTypeBadge type={detailJob.tipe} />
              </div>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Durasi Magang</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {detailJob.durasi}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Kuota Pelamar</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {detailJob.kuota} Orang
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Jam Kerja</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                  {detailJob.jamKerja || '08:30 - 16:30 WIB'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Batas Lamaran</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {new Date(detailJob.deadline).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Deskripsi Pekerjaan
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {detailJob.deskripsi}
              </p>
            </div>

            {/* Responsibilities */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Tanggung Jawab Utama
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside">
                {detailJob.tanggungJawab.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Qualifications */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Kualifikasi & Persyaratan
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside">
                {detailJob.kualifikasi.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Benefits */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Benefit & Fasilitas Magang
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {detailJob.benefit.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 text-xs border border-emerald-100 dark:border-emerald-900/40"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setDetailJob(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
              >
                Tutup
              </button>

              {hasApplied(detailJob.id) ? (
                <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  Anda Sudah Melamar Posisi Ini
                </div>
              ) : (
                <button
                  type="button"
                  id="detail-apply-button"
                  onClick={() => {
                    handleOpenApplyModal(detailJob);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Lamar Posisi Ini Sekarang</span>
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* APPLY APPLICATION MODAL */}
      {applyJob && (
        <Modal
          isOpen={!!applyJob}
          onClose={() => setApplyJob(null)}
          title={`Lamar Posisi: ${applyJob.judul}`}
          subtitle={`${applyJob.companyName} • Upah: ${applyJob.kompensasi || 'Uang Saku'}`}
          maxWidth="lg"
        >
          <form onSubmit={handleSubmitApplication} className="space-y-4">
            {/* Applicant Summary */}
            <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-3">
              <img
                src={
                  currentUser?.avatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                }
                alt="Pelamar"
                className="w-10 h-10 rounded-xl object-cover border border-indigo-200 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                  <span>{currentUser?.nama}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 uppercase font-black">
                    {currentUser?.role === 'siswa_sma' ? 'Siswa SMA/SMK' : 'Mahasiswa'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                  {currentUser?.role === 'siswa_sma'
                    ? `${studentProfile?.namaSekolah || studentProfile?.universitas || 'SMK Negeri 1 Jakarta'} • ${studentProfile?.kelas || 'Kelas XI'} (${studentProfile?.jurusan || 'RPL'})`
                    : `${studentProfile?.universitas || 'Universitas'} • ${studentProfile?.jurusan || 'Jurusan'} (Sem. ${studentProfile?.semester || 5})`}
                </div>
              </div>
            </div>

            {/* Motivation Letter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Surat Motivasi / Alasan Melamar *
              </label>
              <textarea
                rows={4}
                required
                id="apply-motivation-input"
                value={motivationLetter}
                onChange={(e) => setMotivationLetter(e.target.value)}
                placeholder="Ceritakan mengapa Anda tertarik dengan posisi ini dan apa nilai tambah yang dapat Anda berikan..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            {/* CV Attachment Source */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Lampiran CV & Surat Pengantar PKL *
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="cvSource"
                    checked={cvSource === 'profile'}
                    onChange={() => setCvSource('profile')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span className="text-slate-700 dark:text-slate-300 flex-1 truncate">
                    Gunakan CV Profil ({studentProfile?.cvFileName || (currentUser?.role === 'siswa_sma' ? 'CV_PKL_Anisa.pdf' : 'CV_Mahasiswa.pdf')})
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/20 cursor-pointer text-xs transition-colors">
                    <UploadCloud className="w-4 h-4 text-indigo-600" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {uploadedCvName ? uploadedCvName : 'Unggah CV / Berkas Baru (PDF, maks. 5MB)'}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleCvFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Portfolio Link */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tautan Portofolio / GitHub / Media Karya (Opsional)
              </label>
              <input
                type="url"
                placeholder="https://github.com/... atau https://behance.net/..."
                value={portfolioLink}
                onChange={(e) => setPortfolioLink(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setApplyJob(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                id="submit-apply-final-btn"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? 'Mengirimkan Lamaran...' : 'Kirim Lamaran Sekarang'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
