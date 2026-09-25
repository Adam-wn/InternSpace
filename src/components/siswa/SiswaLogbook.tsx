import React, { useState } from 'react';
import { User, PklLogbookEntry } from '../../types';
import {
  getPklLogs,
  savePklLog,
  deletePklLog,
  updatePklLogStatus,
  getStudentProfile,
} from '../../services/storage';
import { Modal } from '../common/Modal';
import {
  BookOpen,
  Plus,
  Calendar,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Printer,
  Sparkles,
  Download,
  Filter,
  Check,
  UserCheck,
} from 'lucide-react';

interface SiswaLogbookProps {
  currentUser: User;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const SiswaLogbook: React.FC<SiswaLogbookProps> = ({ currentUser, onNotify }) => {
  const profile = getStudentProfile(currentUser.id);
  const [logs, setLogs] = useState<PklLogbookEntry[]>(() => getPklLogs(currentUser.id));
  const [filterStatus, setFilterStatus] = useState<'semua' | 'disetujui' | 'menunggu_mentor'>('semua');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Form states
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().split('T')[0]);
  const [posisi, setPosisi] = useState('Junior Web & Frontend PKL');
  const [perusahaan, setPerusahaan] = useState('PT Teknologi Nusantara (TekNusa)');
  const [jamMulai, setJamMulai] = useState('08:00');
  const [jamSelesai, setJamSelesai] = useState('16:00');
  const [kegiatan, setKegiatan] = useState('');
  const [hasilPencapaian, setHasilPencapaian] = useState('');

  const refreshLogs = () => {
    setLogs(getPklLogs(currentUser.id));
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kegiatan || !hasilPencapaian) {
      onNotify('Harap isi uraian kegiatan dan hasil pencapaian.', 'error');
      return;
    }

    const newEntry: PklLogbookEntry = {
      id: `pkl-log-${Date.now()}`,
      studentId: currentUser.id,
      tanggal,
      posisi,
      perusahaan,
      kegiatan,
      hasilPencapaian,
      jamMulai,
      jamSelesai,
      statusVerifikasi: 'menunggu_mentor',
      createdAt: new Date().toISOString(),
    };

    savePklLog(newEntry);
    refreshLogs();
    setIsAddModalOpen(false);
    setKegiatan('');
    setHasilPencapaian('');
    onNotify('Catatan harian PKL berhasil disimpan ke logbook!', 'success');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus catatan kegiatan PKL ini?')) {
      deletePklLog(id);
      refreshLogs();
      onNotify('Catatan logbook telah dihapus.', 'info');
    }
  };

  const handleSimulateMentorApprove = (logId: string) => {
    const feedbackList = [
      'Pekerjaan rapi dan sesuai dengan arahan tugas mingguan.',
      'Sangat baik, inisiatif dan pemecahan masalah mandiri memuaskan.',
      'Bagus! Keterampilan teknis meningkat pesat, pertahankan ketelitian.',
      'Disiplin waktu dan dokumentasi hasil kerja sangat lengkap.',
    ];
    const randomFeedback = feedbackList[Math.floor(Math.random() * feedbackList.length)];
    updatePklLogStatus(logId, 'disetujui', randomFeedback);
    refreshLogs();
    onNotify('Catatan PKL berhasil diverifikasi dan disetujui oleh Pembimbing Industri!', 'success');
  };

  const filteredLogs = logs.filter((l) => {
    if (filterStatus === 'semua') return true;
    return l.statusVerifikasi === filterStatus;
  });

  const totalJam = logs.reduce((acc) => acc + 8, 0);
  const totalApproved = logs.filter((l) => l.statusVerifikasi === 'disetujui').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold mb-1 border border-amber-200 dark:border-amber-800">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Jurnal Harian PKL Siswa</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Logbook Kegiatan PKL & Magang
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Dokumentasikan setiap aktivitas harian untuk penilaian nilai rapor PKL dan evaluasi guru pembimbing sekolah.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Cetak / Ekspor Laporan</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Catatan Harian</span>
          </button>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Catatan</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{logs.length} Hari Kerja</div>
          <div className="text-[11px] text-slate-500 mt-1">Estimasi akumulasi: ±{totalJam} Jam Kegiatan</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status Verifikasi</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{totalApproved} Disetujui</div>
          <div className="text-[11px] text-slate-500 mt-1">{logs.length - totalApproved} entri menunggu review</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Sekolah & Guru Pembimbing</div>
          <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {profile?.namaSekolah || profile?.universitas || 'SMK Negeri 1 Jakarta'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            Guru: {profile?.guruPembimbing || 'Drs. Bambang Hidayat, M.Kom'}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilterStatus('semua')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterStatus === 'semua'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Semua ({logs.length})
          </button>
          <button
            onClick={() => setFilterStatus('disetujui')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterStatus === 'disetujui'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Disetujui ({totalApproved})
          </button>
          <button
            onClick={() => setFilterStatus('menunggu_mentor')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterStatus === 'menunggu_mentor'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Menunggu Review ({logs.length - totalApproved})
          </button>
        </div>

        <div className="text-xs text-slate-500 hidden sm:block">
          Klik tombol &quot;Verifikasi Mentor&quot; untuk simulasi persetujuan pembimbing
        </div>
      </div>

      {/* Logs List */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
            Belum ada catatan logbook dengan filter ini
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Catat pekerjaan yang Anda selesaikan hari ini agar terhitung dalam jam kerja PKL resmi.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs cursor-pointer"
          >
            Tambah Catatan Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:border-slate-300 transition-all space-y-3"
            >
              {/* Row 1: Header & Status */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{log.tanggal}</span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {log.posisi}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      <span>{log.perusahaan}</span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>{log.jamMulai} - {log.jamSelesai} WIB</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                      log.statusVerifikasi === 'disetujui'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300'
                        : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300'
                    }`}
                  >
                    {log.statusVerifikasi === 'disetujui' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Disetujui Mentor</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Menunggu Review</span>
                      </>
                    )}
                  </span>

                  <button
                    onClick={() => handleDelete(log.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Hapus Catatan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Row 2: Uraian Kegiatan */}
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Uraian Kegiatan yang Dilakukan:
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  {log.kegiatan}
                </p>
              </div>

              {/* Row 3: Hasil Pencapaian */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  Hasil / Keterampilan yang Dipelajari:
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                  {log.hasilPencapaian}
                </p>
              </div>

              {/* Row 4: Catatan Mentor Industri */}
              {log.catatanMentor ? (
                <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/50 flex items-start gap-2.5">
                  <UserCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300">
                      Catatan Evaluasi Pembimbing Industri:
                    </div>
                    <p className="text-xs text-emerald-900 dark:text-emerald-200 italic mt-0.5">
                      &ldquo;{log.catatanMentor}&rdquo;
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    Belum ada catatan mentor untuk entri ini.
                  </span>
                  <button
                    onClick={() => handleSimulateMentorApprove(log.id)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Simulasi Verifikasi Mentor Industri</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: Tambah Catatan Harian PKL */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Tambah Catatan Kegiatan Harian PKL"
          subtitle="Catat kegiatan harian dan pencapaian kompetensi industri Anda"
          maxWidth="lg"
        >
          <form onSubmit={handleAddLog} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Kegiatan
                </label>
                <input
                  type="date"
                  required
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    required
                    value={jamMulai}
                    onChange={(e) => setJamMulai(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    required
                    value={jamSelesai}
                    onChange={(e) => setJamSelesai(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Perusahaan Mitra Tempat PKL
                </label>
                <input
                  type="text"
                  required
                  value={perusahaan}
                  onChange={(e) => setPerusahaan(e.target.value)}
                  placeholder="e.g. PT Teknologi Nusantara"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Posisi / Divisi Magang
                </label>
                <input
                  type="text"
                  required
                  value={posisi}
                  onChange={(e) => setPosisi(e.target.value)}
                  placeholder="e.g. Junior Web & Frontend PKL"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Uraian Kegiatan Hari Ini (Detail) *
              </label>
              <textarea
                required
                rows={3}
                value={kegiatan}
                onChange={(e) => setKegiatan(e.target.value)}
                placeholder="Jelaskan pekerjaan atau materi yang dipelajari hari ini, misal: Membantu perancangan layout landing page menggunakan Tailwind CSS dan berdiskusi dengan mentor tim rekayasa web."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hasil Pencapaian / Output Kerja *
              </label>
              <input
                type="text"
                required
                value={hasilPencapaian}
                onChange={(e) => setHasilPencapaian(e.target.value)}
                placeholder="e.g. Berhasil menyelesaikan 2 halaman responsif dan push commit ke repository Git."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Simpan Catatan Harian
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: Cetak / Ekspor Laporan PKL Format Rapor */}
      {isPrintModalOpen && (
        <Modal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title="Pratinjau Lembar Laporan Logbook PKL"
          subtitle="Format resmi untuk pelaporan ke guru pembimbing & sekolah"
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Kop Surat PKL */}
            <div className="p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-center space-y-1">
              <div className="font-extrabold uppercase text-sm tracking-wide text-slate-900 dark:text-white">
                LEMBAR CATATAN KEGIATAN PRAKTIK KERJA LAPANGAN (PKL)
              </div>
              <div className="font-semibold text-slate-700 dark:text-slate-300">
                {profile?.namaSekolah || profile?.universitas || 'SMK NEGERI 1 JAKARTA'}
              </div>
              <div className="text-[11px] text-slate-500">
                Tahun Ajaran 2024/2025 • Program Keahlian: {profile?.jurusan || 'Rekayasa Perangkat Lunak'}
              </div>
            </div>

            {/* Identitas Siswa */}
            <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <div><strong>Nama Siswa:</strong> {profile?.nama || currentUser.nama}</div>
              <div><strong>NISN:</strong> {profile?.nisn || '0061298451'}</div>
              <div><strong>Kelas / Tingkat:</strong> {profile?.kelas || 'Kelas XI (11) SMK'}</div>
              <div><strong>Guru Pembimbing:</strong> {profile?.guruPembimbing || 'Drs. Bambang Hidayat, M.Kom'}</div>
            </div>

            {/* Tabel Logbook */}
            <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0 font-bold">
                  <tr>
                    <th className="p-2">No</th>
                    <th className="p-2">Tanggal</th>
                    <th className="p-2">Uraian Pekerjaan</th>
                    <th className="p-2">Hasil Output</th>
                    <th className="p-2">Paraf Mentor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {logs.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="p-2">{idx + 1}</td>
                      <td className="p-2 whitespace-nowrap">{item.tanggal}</td>
                      <td className="p-2 max-w-xs">{item.kegiatan}</td>
                      <td className="p-2">{item.hasilPencapaian}</td>
                      <td className="p-2 text-emerald-600 font-bold">
                        {item.statusVerifikasi === 'disetujui' ? '✓ Sah' : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Area Tanda Tangan */}
            <div className="grid grid-cols-2 text-center text-[11px] pt-4 border-t border-slate-200 dark:border-slate-800">
              <div>
                <p>Mengetahui,</p>
                <p className="font-semibold text-slate-700 dark:text-slate-300">Guru Pembimbing Sekolah</p>
                <div className="h-14"></div>
                <p className="font-bold underline">{profile?.guruPembimbing || 'Drs. Bambang Hidayat, M.Kom'}</p>
                <p className="text-slate-400">NIP. 19750812 200212 1 003</p>
              </div>

              <div>
                <p>Menyetujui,</p>
                <p className="font-semibold text-slate-700 dark:text-slate-300">Pembimbing Industri Mitra</p>
                <div className="h-14"></div>
                <p className="font-bold underline">Dimas Pratama, S.Kom</p>
                <p className="text-slate-400">PT Teknologi Nusantara (TekNusa)</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  window.print();
                  onNotify('Membuka dialog cetak dokumen laporan...', 'info');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Lembar Laporan</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
