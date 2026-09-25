import React, { useState } from 'react';
import { User, StudentProfile, CompletedInternship } from '../../types';
import { getStudentProfile, saveStudentProfile } from '../../services/storage';
import {
  User as UserIcon,
  GraduationCap,
  Phone,
  Mail,
  FileText,
  UploadCloud,
  Plus,
  X,
  Linkedin,
  Globe,
  Award,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

interface StudentProfileViewProps {
  currentUser: User;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({ currentUser, onNotify }) => {
  const existingProfile = getStudentProfile(currentUser.id);

  const [nama, setNama] = useState(existingProfile?.nama || currentUser.nama);
  const [universitas, setUniversitas] = useState(existingProfile?.universitas || 'Universitas Indonesia');
  const [jurusan, setJurusan] = useState(existingProfile?.jurusan || 'Teknik Informatika');
  const [semester, setSemester] = useState<number>(existingProfile?.semester || 5);
  const [noHp, setNoHp] = useState(existingProfile?.noHp || '081234567890');
  const [fotoUrl, setFotoUrl] = useState(
    existingProfile?.fotoUrl ||
      currentUser.avatarUrl ||
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
  );
  const [bio, setBio] = useState(
    existingProfile?.bio ||
      'Mahasiswa yang bersemangat dalam pengembangan teknologi dan mencari peluang magang industri yang menantang.'
  );
  const [linkedinUrl, setLinkedinUrl] = useState(existingProfile?.linkedinUrl || '');
  const [portfolioUrl, setPortfolioUrl] = useState(existingProfile?.portfolioUrl || '');
  const [cvFileName, setCvFileName] = useState(
    existingProfile?.cvFileName || 'CV_Dimas_Pratama_Fullstack.pdf'
  );

  // Skills
  const [skills, setSkills] = useState<string[]>(
    existingProfile?.skills || ['React', 'TypeScript', 'Node.js', 'Tailwind CSS']
  );
  const [newSkillInput, setNewSkillInput] = useState('');

  // Completed internships
  const [internships, setInternships] = useState<CompletedInternship[]>(
    existingProfile?.completedInternships || []
  );
  const [showAddInternship, setShowAddInternship] = useState(false);
  const [newPosisi, setNewPosisi] = useState('');
  const [newPerusahaan, setNewPerusahaan] = useState('');
  const [newPeriode, setNewPeriode] = useState('');
  const [newDeskripsi, setNewDeskripsi] = useState('');

  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    if (skills.includes(newSkillInput.trim())) {
      onNotify('Skill sudah ada di daftar.', 'info');
      return;
    }
    setSkills([...skills, newSkillInput.trim()]);
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        onNotify('Ukuran file maksimal 5 MB.', 'error');
        return;
      }
      setCvFileName(file.name);
      onNotify(`File CV berhasil diperbarui: ${file.name}`, 'success');
    }
  };

  const handleAddInternship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPosisi || !newPerusahaan) {
      onNotify('Posisi dan Perusahaan wajib diisi.', 'error');
      return;
    }
    const newInt: CompletedInternship = {
      id: `int-${Date.now()}`,
      posisi: newPosisi,
      perusahaan: newPerusahaan,
      periode: newPeriode || '2024',
      deskripsi: newDeskripsi || 'Menyelesaikan tugas magang dengan hasil memuaskan.',
    };
    setInternships([...internships, newInt]);
    setNewPosisi('');
    setNewPerusahaan('');
    setNewPeriode('');
    setNewDeskripsi('');
    setShowAddInternship(false);
    onNotify('Riwayat magang berhasil ditambahkan!', 'success');
  };

  const handleRemoveInternship = (id: string) => {
    setInternships(internships.filter((i) => i.id !== id));
    onNotify('Riwayat magang dihapus.', 'info');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StudentProfile = {
      userId: currentUser.id,
      nama,
      universitas,
      jurusan,
      semester,
      noHp,
      fotoUrl,
      cvUrl: 'https://example.com/cv.pdf',
      cvFileName,
      skills,
      bio,
      linkedinUrl,
      portfolioUrl,
      completedInternships: internships,
    };

    saveStudentProfile(updated);
    onNotify('Profil mahasiswa berhasil disimpan dan diperbarui!', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Profil & Curriculum Vitae (CV)
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Lengkapi data diri dan portofolio Anda agar peluang diterima di perusahaan impian semakin besar
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Card: Foto & Identitas Pokok */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Informasi Pribadi & Kontak
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            <img
              src={fotoUrl}
              alt={nama}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500 shadow-xs shrink-0"
            />
            <div className="flex-1 w-full space-y-2 text-xs">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                URL Foto Profil
              </label>
              <input
                type="url"
                value={fotoUrl}
                onChange={(e) => setFotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
              />
              <p className="text-[11px] text-slate-400">
                Gunakan URL foto formal dengan pencahayaan yang jelas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap *
              </label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor WhatsApp / HP Aktif *
              </label>
              <input
                type="tel"
                required
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                placeholder="0812xxxx"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ringkasan Bio & Minat Karir
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ceritakan ketertarikan karir, bidang yang Anda kuasai, dan tujuan magang..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
        </div>

        {/* Card: Pendidikan */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Data Akademik & Kampus
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Universitas / Institut *
              </label>
              <input
                type="text"
                required
                value={universitas}
                onChange={(e) => setUniversitas(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jurusan / Program Studi *
              </label>
              <input
                type="text"
                required
                value={jurusan}
                onChange={(e) => setJurusan(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Semester Berjalan
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Card: CV & Portofolio */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Dokumen CV & Tautan Portofolio
          </h2>

          <div className="p-4 rounded-xl border border-dashed border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/40 dark:bg-indigo-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-600 text-white shadow-xs">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{cvFileName}</p>
                <p className="text-[11px] text-slate-500">Format PDF/DOC • Maksimal 5 MB</p>
              </div>
            </div>

            <label className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-indigo-600 dark:text-indigo-400 text-xs font-bold shadow-xs cursor-pointer transition-colors flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4" />
              <span>Ganti File CV</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleCvUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Link Profil LinkedIn
              </label>
              <div className="relative">
                <Linkedin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Link Portofolio / GitHub / Behance
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="url"
                  placeholder="https://portfolio-anda.com"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card: Skills */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Keahlian & Tag Skill
          </h2>

          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-rose-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              placeholder="Ketik skill baru (misal: Python, Figma, SQL)..."
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Tambah
            </button>
          </div>
        </div>

        {/* Card: Riwayat Magang */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Riwayat Magang Sebelumnya
              </h2>
              <p className="text-xs text-slate-500">
                Pengalaman kerja praktik atau magang yang pernah Anda jalani
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddInternship(!showAddInternship)}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Riwayat
            </button>
          </div>

          {showAddInternship && (
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/20 space-y-3">
              <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                Form Tambah Pengalaman Magang
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Posisi Magang (misal: UI Designer Intern)"
                  value={newPosisi}
                  onChange={(e) => setNewPosisi(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Nama Perusahaan / Organisasi"
                  value={newPerusahaan}
                  onChange={(e) => setNewPerusahaan(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <input
                type="text"
                placeholder="Periode (misal: Juni 2024 - Agustus 2024)"
                value={newPeriode}
                onChange={(e) => setNewPeriode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
              <textarea
                rows={2}
                placeholder="Deskripsi pencapaian dan tanggung jawab..."
                value={newDeskripsi}
                onChange={(e) => setNewDeskripsi(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddInternship(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleAddInternship}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                >
                  Simpan Riwayat
                </button>
              </div>
            </div>
          )}

          {internships.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">
              Belum ada riwayat magang yang ditambahkan.
            </p>
          ) : (
            <div className="space-y-2.5">
              {internships.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.posisi} • <span className="font-medium text-slate-600 dark:text-slate-300">{item.perusahaan}</span>
                    </h4>
                    <span className="text-[11px] text-slate-400 block mt-0.5">{item.periode}</span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {item.deskripsi}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveInternship(item.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Action */}
        <div className="flex justify-end">
          <button
            type="submit"
            id="save-profile-btn"
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Simpan Seluruh Perubahan Profil
          </button>
        </div>
      </form>
    </div>
  );
};
