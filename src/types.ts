export type UserRole = 'mahasiswa' | 'perusahaan' | 'admin' | 'siswa_sma';

export interface User {
  id: string;
  nama: string;
  email: string;
  password?: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  isBlocked?: boolean;
  statusAktif?: 'aktif' | 'diblokir';
}

export interface CompletedInternship {
  id: string;
  posisi: string;
  perusahaan: string;
  periode: string;
  deskripsi: string;
  suratKeteranganUrl?: string;
}

export interface StudentProfile {
  userId: string;
  nama: string;
  universitas: string; // Universitas atau Nama Sekolah
  jurusan: string; // Jurusan Kuliah atau Jurusan SMK / Peminatan SMA
  semester: number; // Semester (Mahasiswa) atau Tingkat Kelas (10, 11, 12 untuk Siswa)
  jenjang?: 'mahasiswa' | 'siswa_sma';
  namaSekolah?: string;
  kelas?: string; // misal "Kelas XI (11) SMK" atau "Kelas XII (12) SMA"
  nisn?: string; // Nomor Induk Siswa Nasional
  guruPembimbing?: string;
  kontakGuru?: string;
  noHp: string;
  fotoUrl: string;
  cvUrl: string;
  cvFileName: string;
  skills: string[];
  bio: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  suratPengantarPklUrl?: string;
  suratIzinOrtuUrl?: string;
  completedInternships: CompletedInternship[];
}

export interface PklLogbookEntry {
  id: string;
  studentId: string;
  tanggal: string; // YYYY-MM-DD
  posisi: string;
  perusahaan: string;
  kegiatan: string;
  hasilPencapaian: string;
  jamMulai: string;
  jamSelesai: string;
  statusVerifikasi: 'menunggu_mentor' | 'disetujui' | 'revisi';
  catatanMentor?: string;
  createdAt: string;
}

export type CompanyVerificationStatus = 'menunggu' | 'terverifikasi' | 'ditolak';

export interface CompanyProfile {
  userId: string;
  namaPerusahaan: string;
  logoUrl: string;
  deskripsi: string;
  industri: string;
  alamat: string;
  kota: string;
  website: string;
  emailKontak?: string;
  noTelepon?: string;
  noTelp?: string;
  statusVerifikasi: CompanyVerificationStatus;
  alasanPenolakan?: string;
  createdAt: string;
}

export type JobType = 'remote' | 'onsite' | 'hybrid';
export type JobStatus = 'aktif' | 'nonaktif' | 'menunggu_moderasi' | 'ditolak';
export type TargetJenjang = 'semua' | 'siswa_sma' | 'mahasiswa';

export interface JobListing {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  companyCity: string;
  judul: string;
  deskripsi: string;
  tanggungJawab: string[];
  kualifikasi: string[];
  benefit: string[];
  kategori: string;
  lokasi: string;
  tipe: JobType;
  durasi: string; // misal "3 Bulan", "6 Bulan"
  kuota: number;
  deadline: string; // ISO date string
  kompensasi?: string; // misal "Rp 3.500.000 / bulan" atau "Uang Saku + Transport"
  upahNominal?: number; // Nominal per bulan dalam rupiah untuk filter & sorting (e.g. 2500000)
  targetJenjang?: TargetJenjang; // 'semua' | 'siswa_sma' | 'mahasiswa'
  jamKerja?: string; // misal "08.00 - 16.00 WIB (Senin - Jumat) - Ramah Pelajar"
  bimbinganMentor?: boolean;
  suratPklResmi?: boolean;
  status: JobStatus;
  createdAt: string;
  alasanModerasi?: string;
}

export type ApplicationStatus = 'menunggu' | 'direview' | 'interview' | 'diterima' | 'ditolak';

export interface Application {
  id: string;
  lowonganId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  studentUniversity: string;
  studentMajor: string;
  studentSkills?: string[];
  studentAvatar?: string;
  cvUrl: string;
  cvFileName: string;
  motivationLetter: string;
  portfolioLink?: string;
  status: ApplicationStatus;
  catatanInternal?: string;
  jadwalInterview?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InAppNotification {
  id: string;
  userId: string;
  judul: string;
  pesan: string;
  isRead: boolean;
  read?: boolean;
  type: 'status_update' | 'verification' | 'job_alert' | 'system';
  linkTarget?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
}
