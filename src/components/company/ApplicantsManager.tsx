import React, { useState, useMemo } from 'react';
import { User, Application, ApplicationStatus, JobListing } from '../../types';
import {
  getApplicationsByCompany,
  getJobsByCompany,
  updateApplicationStatus,
  getJobById,
} from '../../services/storage';
import { ApplicationStatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  Users,
  Search,
  Filter,
  Download,
  FileText,
  Video,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  MessageSquare,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';

interface ApplicantsManagerProps {
  currentUser: User;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
  filterJobId?: string | null;
}

export const ApplicantsManager: React.FC<ApplicantsManagerProps> = ({
  currentUser,
  onNotify,
  filterJobId,
}) => {
  const allJobs = getJobsByCompany(currentUser.id);
  const applications = getApplicationsByCompany(currentUser.id);

  const [selectedJobId, setSelectedJobId] = useState<string>(filterJobId || 'semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected applicant for status change & interview scheduling modal
  const [activeApp, setActiveApp] = useState<Application | null>(null);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('direview');
  const [interviewSchedule, setInterviewSchedule] = useState('');
  const [internalNote, setInternalNote] = useState('');

  // Filter logic
  const filteredApplicants = useMemo(() => {
    return applications.filter((app) => {
      const matchJob = selectedJobId === 'semua' || app.lowonganId === selectedJobId;
      const matchStatus = selectedStatus === 'semua' || app.status === selectedStatus;
      const matchSearch =
        app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.studentUniversity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.studentMajor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.studentSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchJob && matchStatus && matchSearch;
    });
  }, [applications, selectedJobId, selectedStatus, searchQuery]);

  const handleOpenStatusModal = (app: Application) => {
    setActiveApp(app);
    setNewStatus(app.status);
    setInterviewSchedule(app.jadwalInterview || 'Selasa, 18 Maret 2025 pukul 13:00 WIB via Google Meet');
    setInternalNote(app.catatanInternal || '');
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApp) return;

    updateApplicationStatus(
      activeApp.id,
      newStatus,
      internalNote,
      newStatus === 'interview' ? interviewSchedule : undefined
    );

    onNotify(
      `Status pelamar ${activeApp.studentName} berhasil diperbarui menjadi ${newStatus.toUpperCase()}.`,
      'success'
    );
    setActiveApp(null);
  };

  // Export to CSV Function
  const handleExportCSV = () => {
    if (filteredApplicants.length === 0) {
      onNotify('Tidak ada data pelamar untuk diekspor.', 'info');
      return;
    }

    const headers = ['ID,Nama Pelamar,Email,No HP,Universitas,Jurusan,Posisi Dilamar,Status,Jadwal Interview,Catatan'];
    const rows = filteredApplicants.map((app) => {
      const job = getJobById(app.lowonganId);
      return `"${app.id}","${app.studentName}","${app.studentEmail}","${app.studentPhone}","${app.studentUniversity}","${app.studentMajor}","${job?.judul || 'Lowongan'}","${app.status}","${app.jadwalInterview || '-'}","${(app.catatanInternal || '').replace(/"/g, '""')}"`;
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pelamar_internspace_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onNotify('Daftar pelamar berhasil diunduh sebagai file CSV.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Kelola Pelamar Magang ({filteredApplicants.length})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tinjau berkas CV, evaluasi surat motivasi, jadwalkan wawancara, dan tetapkan keputusan seleksi
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          id="btn-export-applicants"
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Ekspor Data CSV</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari nama mahasiswa, universitas, program studi, atau skill (e.g. React)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              Filter Lowongan
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="semua">Semua Lowongan Anda ({allJobs.length})</option>
              {allJobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.judul} ({job.durasi})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              Tahap Seleksi
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="semua">Semua Tahap</option>
              <option value="menunggu">Menunggu Review</option>
              <option value="direview">Sedang Direview</option>
              <option value="interview">Tahap Interview</option>
              <option value="diterima">Diterima</option>
              <option value="ditolak">Tidak Lolos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applicants List */}
      {filteredApplicants.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Tidak ada pelamar yang cocok
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Coba ubah kata kunci pencarian atau sesuaikan filter lowongan dan tahap seleksi.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplicants.map((app) => {
            const job = getJobById(app.lowonganId);

            return (
              <div
                key={app.id}
                id={`applicant-card-${app.id}`}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-indigo-200 transition-all"
              >
                {/* Top: Candidate info & Status */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3.5">
                    <img
                      src={
                        app.studentAvatar ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                      }
                      alt={app.studentName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-100 dark:border-slate-800 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                          {app.studentName}
                        </h3>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold">
                          Melamar: {job?.judul || 'Lowongan'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        {app.studentUniversity} • {app.studentMajor}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {app.studentEmail}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {app.studentPhone}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start">
                    <ApplicationStatusBadge status={app.status} size="md" />
                    <button
                      onClick={() => handleOpenStatusModal(app)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors"
                    >
                      Ubah Status
                    </button>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  <span className="text-[11px] font-bold text-slate-400 mr-1">Skills:</span>
                  {app.studentSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Motivation Letter Box */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs mb-3">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Surat Motivasi Pelamar:
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    "{app.motivationLetter}"
                  </p>
                </div>

                {/* Interview / Note Highlight */}
                {app.status === 'interview' && app.jadwalInterview && (
                  <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 text-xs mb-3 flex items-center gap-2">
                    <Video className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span>
                      <strong>Jadwal Interview:</strong> {app.jadwalInterview}
                    </span>
                  </div>
                )}

                {app.catatanInternal && (
                  <div className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 text-xs mb-3 flex items-center gap-2 border border-amber-200/50 dark:border-amber-900/40">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>
                      <strong>Catatan Tim HR:</strong> {app.catatanInternal}
                    </span>
                  </div>
                )}

                {/* CV & Links footer */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onNotify(`Membuka dokumen ${app.cvFileName}...`, 'info')}
                      className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Lihat CV ({app.cvFileName || 'CV_Mahasiswa.pdf'})</span>
                    </button>

                    {app.portfolioLink && (
                      <a
                        href={app.portfolioLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Portofolio
                      </a>
                    )}
                  </div>

                  <span className="text-slate-400 text-[11px]">
                    Masuk:{' '}
                    {new Date(app.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* UPDATE STATUS & INTERVIEW MODAL */}
      {activeApp && (
        <Modal
          isOpen={!!activeApp}
          onClose={() => setActiveApp(null)}
          title={`Perbarui Status: ${activeApp.studentName}`}
          subtitle="Tentukan tahap seleksi dan berikan catatan atau jadwal wawancara untuk mahasiswa"
          maxWidth="md"
        >
          <form onSubmit={handleSaveStatus} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Tahap Status Baru *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['menunggu', 'direview', 'interview', 'diterima', 'ditolak'] as ApplicationStatus[]).map(
                  (st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewStatus(st)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all text-center capitalize ${
                        newStatus === st
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>
            </div>

            {newStatus === 'interview' && (
              <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 space-y-2">
                <label className="block text-xs font-bold text-purple-900 dark:text-purple-200">
                  Tentukan Jadwal & Link Wawancara *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Selasa, 18 Maret 2025 pukul 10:00 WIB via Google Meet (meet.google.com/xyz)"
                  value={interviewSchedule}
                  onChange={(e) => setInterviewSchedule(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-[11px] text-purple-700 dark:text-purple-300">
                  Jadwal ini akan langsung muncul di halaman lamaran mahasiswa bersangkutan.
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Catatan Internal HR (Opsional)
              </label>
              <textarea
                rows={3}
                placeholder="Catatan kelebihan, hasil asesmen teknis, atau instruksi tindak lanjut..."
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveApp(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Batal
              </button>
              <button
                type="submit"
                id="save-applicant-status-btn"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
              >
                Simpan Keputusan
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
