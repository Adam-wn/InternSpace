import React, { useState, useEffect } from 'react';
import { User, StudentProfile } from '../../types';
import { getStudentProfile, saveStudentProfile } from '../../services/storage';
import {
  School,
  User as UserIcon,
  GraduationCap,
  FileText,
  Phone,
  BookOpen,
  Award,
  Link as LinkIcon,
  Save,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  Plus,
  X,
  UploadCloud,
} from 'lucide-react';

interface SiswaProfileViewProps {
  currentUser: User;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const SiswaProfileView: React.FC<SiswaProfileViewProps> = ({ currentUser, onNotify }) => {
  const [profile, setProfile] = useState<StudentProfile | null>(() => getStudentProfile(currentUser.id));

  // Form states
  const [nama, setNama] = useState(profile?.nama || currentUser.nama || '');
  const [namaSekolah, setNamaSekolah] = useState(profile?.namaSekolah || profile?.universitas || 'SMK Negeri 1 Jakarta');
  const [jurusan, setJurusan] = useState(profile?.jurusan || 'Rekayasa Perangkat Lunak (RPL)');
  const [kelas, setKelas] = useState(profile?.kelas || 'Kelas XI (11) SMK');
  const [nisn, setNisn] = useState(profile?.nisn || '0061298451');
  const [guruPembimbing, setGuruPembimbing] = useState(profile?.guruPembimbing || 'Drs. Bambang Hidayat, M.Kom');
  const [kontakGuru, setKontakGuru] = useState(profile?.kontakGuru || '081298765432');
  const [noHp, setNoHp] = useState(profile?.noHp || '081234567891');
  const [bio, setBio] = useState(profile?.bio || '');
  const [portfolioUrl, setPortfolioUrl] = useState(profile?.portfolioUrl || '');
  const [fotoUrl, setFotoUrl] = useState(profile?.fotoUrl || currentUser.avatarUrl || '');

  // Skills
  const [skills, setSkills] = useState<string[]>(profile?.skills || [
    'HTML5 & CSS3',
    'JavaScript Dasar',
    'Figma Wireframing',
    'Microsoft Office',
    'Disiplin Waktu',
  ]);
  const [newSkill, setNewSkill] = useState('');

  // Surat Pengantar & Izin
  const [hasSuratSekolah, setHasSuratSekolah] = useState(true);
  const [hasIzinOrtu, setHasIzinOrtu] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const p = getStudentProfile(currentUser.id);
    if (p) {
      setProfile(p);
      setNama(p.nama);
      setNamaSekolah(p.namaSekolah || p.universitas || 'SMK Negeri 1 Jakarta');
      setJurusan(p.jurusan);
      setKelas(p.kelas || 'Kelas XI (11) SMK');
      setNisn(p.nisn || '0061298451');
      setGuruPembimbing(p.guruPembimbing || 'Drs. Bambang Hidayat, M.Kom');
      setKontakGuru(p.kontakGuru || '081298765432');
      setNoHp(p.noHp || '');
      setBio(p.bio || '');
      setPortfolioUrl(p.portfolioUrl || '');
      setSkills(p.skills || []);
    }
  }, [currentUser]);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updated: StudentProfile = {
      userId: currentUser.id,
      nama,
      universitas: namaSekolah,
      namaSekolah,
      jurusan,
      semester: kelas.includes('XII') ? 12 : 11,
      kelas,
      jenjang: 'siswa_sma',
      nisn,
      guruPembimbing,
      kontakGuru,
      noHp,
      fotoUrl,
      cvUrl: profile?.cvUrl || 'https://example.com/cv-siswa.pdf',
      cvFileName: profile?.cvFileName || `CV_PKL_${nama.replace(/\s+/g, '_')}.pdf`,
      skills,
      bio,
      portfolioUrl,
      completedInternships: profile?.completedInternships || [],
    };

    setTimeout(() => {
      saveStudentProfile(updated);
      setIsSaving(false);
      onNotify('Profil siswa & data administrasi PKL berhasil diperbarui!', 'success');
    }, 300);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold mb-1 border border-amber-200 dark:border-amber-800">
            <School className="w-3.5 h-3.5" />
            <span>Profil Siswa SMA / SMK</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Data Diri & Kelengkapan Berkas PKL
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Informasi sekolah, NISN, dan guru pembimbing yang akan otomatis tercantum pada surat lamaran magang Anda.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Menyimpan...' : 'Simpan Profil'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identitas Siswa & Asal Sekolah */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <UserIcon className="w-4 h-4 text-amber-600" />
            Identitas Siswa & Informasi Sekolah
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap Siswa *
              </label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Asal Sekolah (SMK / SMA) *
              </label>
              <input
                type="text"
                required
                value={namaSekolah}
                onChange={(e) => setNamaSekolah(e.target.value)}
                placeholder="e.g. SMK Negeri 1 Jakarta / SMA Al-Azhar"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jurusan / Peminatan Kejuruan *
              </label>
              <input
                type="text"
                required
                value={jurusan}
                onChange={(e) => setJurusan(e.target.value)}
                placeholder="e.g. Rekayasa Perangkat Lunak (RPL), TKJ, DKV, Akuntansi"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kelas / Tingkat *
                </label>
                <select
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="Kelas X (10) SMK">Kelas X (10) SMK</option>
                  <option value="Kelas XI (11) SMK">Kelas XI (11) SMK</option>
                  <option value="Kelas XII (12) SMK">Kelas XII (12) SMK</option>
                  <option value="Kelas XI (11) SMA">Kelas XI (11) SMA</option>
                  <option value="Kelas XII (12) SMA">Kelas XII (12) SMA</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  NISN Siswa *
                </label>
                <input
                  type="text"
                  required
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  placeholder="e.g. 0061298451"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bimbingan Sekolah & Kontak */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            Guru Pembimbing Sekolah & Kontak Darurat
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Guru Pembimbing PKL Sekolah
              </label>
              <input
                type="text"
                value={guruPembimbing}
                onChange={(e) => setGuruPembimbing(e.target.value)}
                placeholder="e.g. Drs. Bambang Hidayat, M.Kom"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                No. HP / WhatsApp Guru Pembimbing
              </label>
              <input
                type="tel"
                value={kontakGuru}
                onChange={(e) => setKontakGuru(e.target.value)}
                placeholder="e.g. 081298765432"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                No. WhatsApp Siswa *
              </label>
              <input
                type="tel"
                required
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                placeholder="e.g. 081234567891"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tautan Portofolio / GitHub / Media Karya
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://github.com/username atau https://behance.net/..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Berkas Persyaratan Administrasi PKL */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            Status Dokumen Persyaratan PKL
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
              <input
                type="checkbox"
                checked={hasSuratSekolah}
                onChange={(e) => setHasSuratSekolah(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
              />
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Surat Tugas & Rekomendasi PKL dari Sekolah
                </div>
                <div className="text-[11px] text-slate-500">
                  Dikeluarkan oleh Kepala Program Keahlian / Hubin
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
              <input
                type="checkbox"
                checked={hasIzinOrtu}
                onChange={(e) => setHasIzinOrtu(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
              />
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Surat Pernyataan Izin Orang Tua / Wali
                </div>
                <div className="text-[11px] text-slate-500">
                  Telah ditandatangani dan disetujui wali murid
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Keahlian & Bio */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Award className="w-4 h-4 text-purple-600" />
            Keahlian / Skills & Ringkasan Siswa
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Daftar Keterampilan yang Dikuasai
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-semibold border border-amber-200 dark:border-amber-800"
                >
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s)}
                    className="hover:text-rose-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Tambah keahlian baru (misal: Canva, CSS Grid, Photoshop)..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Tambah
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Bio Singkat / Minat Magang
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ceritakan tentang diri Anda, motivasi mengikuti program magang, dan harapan belajar di industri mitra..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white leading-relaxed"
            />
          </div>
        </div>

        {/* Bottom Save Button */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan Perubahan...' : 'Simpan Semua Data Siswa'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
