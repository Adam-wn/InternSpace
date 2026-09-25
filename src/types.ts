export type UserRole = 'mahasiswa' | 'perusahaan' | 'admin';

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
  universitas: string;
  jurusan: string;
  semester: number;
  noHp: string;
  fotoUrl: string;
  cvUrl: string;
  cvFileName: string;
  skills: string[];
  bio: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  completedInternships: CompletedInternship[];
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
