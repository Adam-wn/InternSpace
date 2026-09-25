import React, { useState } from 'react';
import { User, JobListing, JobType, JobStatus } from '../../types';
import {
  getJobsByCompany,
  saveJob,
  deleteJob,
  getApplicationsByCompany,
  getCompanyProfile,
} from '../../services/storage';
import { JobStatusBadge, JobTypeBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  Plus,
  Briefcase,
  Edit,
  Trash2,
  Users,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  AlertCircle,
  Eye,
  CheckCircle2,
  X,
} from 'lucide-react';

interface CompanyJobsProps {
  currentUser: User;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
  onViewApplicantsForJob: (jobId: string) => void;
}

export const CompanyJobs: React.FC<CompanyJobsProps> = ({
  currentUser,
  onNotify,
  onViewApplicantsForJob,
}) => {
  const companyProfile = getCompanyProfile(currentUser.id);
  const jobs = getJobsByCompany(currentUser.id);
  const allApplicants = getApplicationsByCompany(currentUser.id);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobListing | null>(null);

  // Form states
  const [judul, setJudul] = useState('');
  const [kategori, setKategori] = useState('IT & Software');
  const [tipe, setTipe] = useState<JobType>('hybrid');
  const [lokasi, setLokasi] = useState(companyProfile?.kota || 'Jakarta Selatan');
  const [durasi, setDurasi] = useState('6 Bulan');
  const [kuota, setKuota] = useState(3);
  const [deadline, setDeadline] = useState('2025-05-30');
  const [kompensasi, setKompensasi] = useState('Rp 3.500.000 / bulan');
  const [deskripsi, setDeskripsi] = useState('');

  // Dynamic list states
  const [responsibilities, setResponsibilities] = useState<string[]>([
    'Mengembangkan dan memelihara fitur-fitur antarmuka aplikasi.',
    'Bekerja sama dengan Product Designer dan Product Manager.',
  ]);
  const [newResp, setNewResp] = useState('');

  const [qualifications, setQualifications] = useState<string[]>([
    'Mahasiswa aktif semester 5-8 program studi relevan.',
    'Menguasai dasar pemrograman dan memiliki kemauan belajar yang kuat.',
  ]);
  const [newQual, setNewQual] = useState('');

  const [benefits, setBenefits] = useState<string[]>([
    'Uang saku bulanan kompetitif',
    'Mentoring 1-on-1 dari tim profesional',
    'Sertifikat resmi magang industri',
  ]);
  const [newBen, setNewBen] = useState('');

  const handleOpenAdd = () => {
    setEditingJob(null);
    setJudul('');
    setKategori('IT & Software');
    setTipe('hybrid');
    setLokasi(companyProfile?.kota || 'Jakarta Selatan');
    setDurasi('6 Bulan');
    setKuota(2);
    setDeadline('2025-06-30');
    setKompensasi('Rp 3.500.000 / bulan');
    setDeskripsi(
      'Kami mencari mahasiswa berbakat dan berdedikasi tinggi untuk bergabung dalam program magang intensif di perusahaan kami.'
    );
    setResponsibilities([
      'Melakukan riset dan analisis kebutuhan pengguna.',
      'Membantu penyusunan materi dan implementasi proyek tim.',
    ]);
    setQualifications([
      'Mahasiswa aktif semester 5 ke atas.',
      'Memiliki motivasi tinggi dan keterampilan komunikasi yang baik.',
    ]);
    setBenefits(['Uang saku bulanan', 'Sertifikat magang', 'Fleksibilitas kerja']);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (job: JobListing) => {
    setEditingJob(job);
    setJudul(job.judul);
    setKategori(job.kategori);
    setTipe(job.tipe);
    setLokasi(job.lokasi);
    setDurasi(job.durasi);
    setKuota(job.kuota);
    setDeadline(job.deadline);
    setKompensasi(job.kompensasi || '');
    setDeskripsi(job.deskripsi);
    setResponsibilities([...job.tanggungJawab]);
    setQualifications([...job.kualifikasi]);
    setBenefits([...job.benefit]);
    setIsModalOpen(true);
  };

  const handleDelete = (job: JobListing) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus lowongan "${job.judul}"?`)) {
      deleteJob(job.id);
      onNotify('Lowongan berhasil dihapus.', 'info');
    }
  };

  const handleToggleActive = (job: JobListing) => {
    const newStatus: JobStatus = job.status === 'aktif' ? 'nonaktif' : 'aktif';
    const updated: JobListing = { ...job, status: newStatus };
    saveJob(updated);
    onNotify(`Status lowongan diubah menjadi ${newStatus.toUpperCase()}.`, 'success');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !deskripsi.trim()) {
      onNotify('Judul dan deskripsi posisi wajib diisi.', 'error');
      return;
    }

    const jobData: JobListing = {
      id: editingJob ? editingJob.id : `job-${Date.now()}`,
      companyId: currentUser.id,
      companyName: companyProfile?.namaPerusahaan || currentUser.nama,
      companyLogo:
        companyProfile?.logoUrl ||
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&auto=format&fit=crop&q=80',
      companyCity: companyProfile?.kota || lokasi,
      judul,
      deskripsi,
      tanggungJawab: responsibilities,
      kualifikasi: qualifications,
      benefit: benefits,
      kategori,
      lokasi,
      tipe,
      durasi,
      kuota: Number(kuota),
      deadline,
      kompensasi,
      status: editingJob ? editingJob.status : 'aktif',
      createdAt: editingJob ? editingJob.createdAt : new Date().toISOString(),
    };

    saveJob(jobData);
    setIsModalOpen(false);
    onNotify(
      editingJob
        ? `Lowongan "${judul}" berhasil diperbarui!`
        : `Lowongan baru "${judul}" berhasil diterbitkan!`,
      'success'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Kelola Lowongan Magang
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Buka posisi baru, tinjau pelamar, dan perbarui persyaratan magang perusahaan Anda
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          id="btn-open-create-job-modal"
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Lowongan Baru</span>
        </button>
      </div>

      {/* Jobs Table & Cards */}
      {jobs.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Belum ada lowongan yang diterbitkan
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Mulai rekrut talenta magang terbaik dari kampus ternama dengan menerbitkan posisi magang pertama Anda.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
          >
            Buat Lowongan Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => {
            const applicants = allApplicants.filter((a) => a.lowonganId === job.id);

            return (
              <div
                key={job.id}
                id={`company-job-card-${job.id}`}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">
                        {job.kategori}
                      </span>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                        {job.judul}
                      </h3>
                    </div>
                    <JobStatusBadge status={job.status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 my-2.5">
                    <JobTypeBadge type={job.tipe} />
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {job.durasi}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <Users className="w-3 h-3 text-slate-400" />
                      Kuota: {job.kuota}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                    {job.deskripsi}
                  </p>

                  <div className="text-[11px] text-slate-500 space-y-1 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Batas Akhir: {new Date(job.deadline).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>{job.kompensasi || 'Uang Saku'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onViewApplicantsForJob(job.id)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Lihat {applicants.length} Pelamar</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(job)}
                      title={job.status === 'aktif' ? 'Nonaktifkan lowongan' : 'Aktifkan lowongan'}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                    >
                      {job.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>

                    <button
                      onClick={() => handleOpenEdit(job)}
                      title="Edit lowongan"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(job)}
                      title="Hapus lowongan"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT JOB MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingJob ? 'Edit Lowongan Magang' : 'Terbitkan Lowongan Magang Baru'}
        subtitle="Lengkapi informasi kriteria, tanggung jawab, dan tunjangan untuk calon pelamar"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Judul Posisi Magang *
            </label>
            <input
              type="text"
              required
              id="job-title-input"
              placeholder="e.g. Frontend Engineer Intern (React & TypeScript)"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kategori Bidang
              </label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              >
                <option value="IT & Software">IT & Software</option>
                <option value="Data & Analytics">Data & Analytics</option>
                <option value="Design & Creative">Design & Creative</option>
                <option value="Finance & Banking">Finance & Banking</option>
                <option value="Marketing & Communication">Marketing & Komunikasi</option>
                <option value="Human Resources">Human Resources (HR)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tipe Kerja
              </label>
              <select
                value={tipe}
                onChange={(e) => setTipe(e.target.value as JobType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              >
                <option value="hybrid">Hybrid (Kantor + Remote)</option>
                <option value="remote">Remote (Full WFA)</option>
                <option value="onsite">On-site (Penuh di Kantor)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Durasi Program
              </label>
              <select
                value={durasi}
                onChange={(e) => setDurasi(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              >
                <option value="3 Bulan">3 Bulan</option>
                <option value="6 Bulan">6 Bulan</option>
                <option value="12 Bulan">1 Tahun (12 Bulan)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Lokasi / Penempatan
              </label>
              <input
                type="text"
                required
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                placeholder="e.g. Jakarta Selatan"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kuota Pelamar Diterima
              </label>
              <input
                type="number"
                min={1}
                required
                value={kuota}
                onChange={(e) => setKuota(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Batas Akhir Lamaran
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Kompensasi / Uang Saku
            </label>
            <input
              type="text"
              placeholder="e.g. Rp 3.500.000 / bulan atau Uang Saku + Transport"
              value={kompensasi}
              onChange={(e) => setKompensasi(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Deskripsi Tugas & Posisi *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Jelaskan gambaran umum peran dan kultur tim..."
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs leading-relaxed"
            />
          </div>

          {/* Dynamic Qualifications List */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Kualifikasi & Persyaratan
            </label>
            <div className="space-y-1.5 mb-2">
              {qualifications.map((q, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg">
                  <span className="truncate flex-1">{q}</span>
                  <button
                    type="button"
                    onClick={() => setQualifications(qualifications.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-rose-500 ml-2"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tambah kualifikasi baru..."
                value={newQual}
                onChange={(e) => setNewQual(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newQual.trim()) {
                      setQualifications([...qualifications, newQual.trim()]);
                      setNewQual('');
                    }
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  if (newQual.trim()) {
                    setQualifications([...qualifications, newQual.trim()]);
                    setNewQual('');
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                + Tambah
              </button>
            </div>
          </div>

          {/* Dynamic Benefits List */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Benefit & Fasilitas
            </label>
            <div className="space-y-1.5 mb-2">
              {benefits.map((b, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-emerald-50/50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-lg">
                  <span className="truncate flex-1 text-emerald-900 dark:text-emerald-200">{b}</span>
                  <button
                    type="button"
                    onClick={() => setBenefits(benefits.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-rose-500 ml-2"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tambah benefit baru (misal: Makan siang gratis, Konversi SKS)..."
                value={newBen}
                onChange={(e) => setNewBen(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newBen.trim()) {
                      setBenefits([...benefits, newBen.trim()]);
                      setNewBen('');
                    }
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  if (newBen.trim()) {
                    setBenefits([...benefits, newBen.trim()]);
                    setNewBen('');
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                + Tambah
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
            >
              Batal
            </button>
            <button
              type="submit"
              id="submit-job-btn"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
            >
              {editingJob ? 'Simpan Perubahan' : 'Terbitkan Lowongan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
