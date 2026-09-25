import {
  User,
  StudentProfile,
  CompanyProfile,
  JobListing,
  Application,
  InAppNotification,
  ActivityLog,
  ApplicationStatus,
  CompanyVerificationStatus,
  JobStatus,
  UserRole,
  PklLogbookEntry,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_STUDENT_PROFILES,
  INITIAL_COMPANY_PROFILES,
  INITIAL_JOBS,
  INITIAL_APPLICATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_PKL_LOGS,
} from '../data/mockData';
import {
  seedFirestoreIfEmpty,
  syncJobToFirestore,
  deleteJobFromFirestore,
  syncApplicationToFirestore,
  syncNotificationToFirestore,
  syncStudentProfileToFirestore,
  syncCompanyProfileToFirestore,
  syncActivityLogToFirestore,
} from './firestoreSync';

const STORAGE_KEYS = {
  USERS: 'internspace_users_v2',
  CURRENT_USER: 'internspace_current_user_v2',
  STUDENT_PROFILES: 'internspace_student_profiles_v2',
  COMPANY_PROFILES: 'internspace_company_profiles_v2',
  JOBS: 'internspace_jobs_v2',
  APPLICATIONS: 'internspace_applications_v2',
  NOTIFICATIONS: 'internspace_notifications_v2',
  ACTIVITY_LOGS: 'internspace_logs_v2',
  BOOKMARKS: 'internspace_bookmarks_v2',
  PKL_LOGS: 'internspace_pkl_logs_v2',
  DARK_MODE: 'internspace_dark_mode_v1',
};

export const SYSTEM_ADMIN_EMAIL = 'adamvkedua2@gmail.com';

// Helper for localStorage
function getItem<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (err) {
    console.warn(`Error reading key ${key} from storage:`, err);
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('internspace_data_changed'));
  } catch (err) {
    console.warn(`Error writing key ${key} to storage:`, err);
  }
}

// Initialize seed data if not present
export function initializeStorage(): void {
  const existingUsers = getItem<User[]>(STORAGE_KEYS.USERS, []);
  if (!existingUsers.length) {
    setItem(STORAGE_KEYS.USERS, INITIAL_USERS);
  } else {
    // Ensure adamvkedua2@gmail.com is configured as the unique admin
    const adminIdx = existingUsers.findIndex((u) => u.email.toLowerCase() === SYSTEM_ADMIN_EMAIL.toLowerCase());
    if (adminIdx === -1) {
      existingUsers.unshift({
        id: 'user-admin-1',
        nama: 'Adam (Admin Utama)',
        email: SYSTEM_ADMIN_EMAIL,
        password: 'password123',
        role: 'admin',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: '2025-01-01T08:00:00.000Z',
        isBlocked: false,
      });
      setItem(STORAGE_KEYS.USERS, existingUsers);
    } else {
      existingUsers[adminIdx].role = 'admin';
      existingUsers[adminIdx].nama = 'Adam (Admin Utama)';
      setItem(STORAGE_KEYS.USERS, existingUsers);
    }
  }

  if (!localStorage.getItem(STORAGE_KEYS.STUDENT_PROFILES)) {
    setItem(STORAGE_KEYS.STUDENT_PROFILES, INITIAL_STUDENT_PROFILES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.COMPANY_PROFILES)) {
    setItem(STORAGE_KEYS.COMPANY_PROFILES, INITIAL_COMPANY_PROFILES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.JOBS)) {
    setItem(STORAGE_KEYS.JOBS, INITIAL_JOBS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.APPLICATIONS)) {
    setItem(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    setItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS)) {
    setItem(STORAGE_KEYS.ACTIVITY_LOGS, INITIAL_ACTIVITY_LOGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PKL_LOGS)) {
    setItem(STORAGE_KEYS.PKL_LOGS, INITIAL_PKL_LOGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKMARKS)) {
    setItem(STORAGE_KEYS.BOOKMARKS, {
      'user-stud-1': ['job-1', 'job-4'],
      'user-siswa-1': ['job-smk-1', 'job-smk-2'],
    });
  }

  // NOTE: User must log in first ("user harus login dulu"). We do NOT set default login.

  // Seed Firestore in background if newly connected
  seedFirestoreIfEmpty().catch((err) => {
    console.warn('Initial Firestore seed check notice:', err);
  });
}

export function resetToDemoData(): void {
  localStorage.removeItem(STORAGE_KEYS.USERS);
  localStorage.removeItem(STORAGE_KEYS.STUDENT_PROFILES);
  localStorage.removeItem(STORAGE_KEYS.COMPANY_PROFILES);
  localStorage.removeItem(STORAGE_KEYS.JOBS);
  localStorage.removeItem(STORAGE_KEYS.APPLICATIONS);
  localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
  localStorage.removeItem(STORAGE_KEYS.ACTIVITY_LOGS);
  localStorage.removeItem(STORAGE_KEYS.BOOKMARKS);
  localStorage.removeItem(STORAGE_KEYS.PKL_LOGS);
  initializeStorage();
  window.dispatchEvent(new Event('internspace_data_changed'));
}

// --- Auth & User Operations ---
export function getCurrentUser(): User | null {
  return getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
}

export function setCurrentUser(user: User | null): void {
  setItem(STORAGE_KEYS.CURRENT_USER, user);
}

export function getUsers(): User[] {
  return getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
}

export function getUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id);
}

export function toggleUserBlocked(userId: string): boolean {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return false;

  const newStatus = !users[index].isBlocked;
  users[index].isBlocked = newStatus;
  users[index].statusAktif = newStatus ? 'diblokir' : 'aktif';
  setItem(STORAGE_KEYS.USERS, users);

  const curr = getCurrentUser();
  logActivity({
    userId: curr?.id || 'system',
    userName: curr?.nama || 'Admin',
    userRole: curr?.role || 'admin',
    action: newStatus ? 'BLOKIR_PENGGUNA' : 'AKTIFKAN_PENGGUNA',
    details: `${newStatus ? 'Memblokir' : 'Membuka blokir'} akun pengguna ${users[index].nama} (${users[index].email})`,
  });

  return newStatus;
}

export const toggleUserStatus = toggleUserBlocked;

export function registerUser(params: {
  nama: string;
  email: string;
  password?: string;
  role: UserRole;
  universitas?: string;
  jurusan?: string;
  semester?: number;
  namaPerusahaan?: string;
  industri?: string;
  alamat?: string;
  kota?: string;
  website?: string;
  noHp?: string;
  namaSekolah?: string;
  kelas?: string;
  nisn?: string;
  guruPembimbing?: string;
  kontakGuru?: string;
}): { success: boolean; user?: User; error?: string } {
  const users = getUsers();
  if (params.role === 'admin') {
    if (params.email.trim().toLowerCase() !== SYSTEM_ADMIN_EMAIL.toLowerCase()) {
      return {
        success: false,
        error: `Pendaftaran Admin ditolak: Peran Admin hanya diizinkan khusus untuk email pemilik sistem (${SYSTEM_ADMIN_EMAIL}).`,
      };
    }
  }

  const emailExists = users.some((u) => u.email.toLowerCase() === params.email.trim().toLowerCase());
  if (emailExists) {
    if (params.role === 'admin' && params.email.trim().toLowerCase() === SYSTEM_ADMIN_EMAIL.toLowerCase()) {
      const adminUser = users.find((u) => u.email.toLowerCase() === SYSTEM_ADMIN_EMAIL.toLowerCase());
      if (adminUser) {
        if (params.nama) adminUser.nama = params.nama;
        if (params.password) adminUser.password = params.password;
        adminUser.role = 'admin';
        setItem(STORAGE_KEYS.USERS, users);
        return { success: true, user: adminUser };
      }
    }
    return { success: false, error: 'Email sudah terdaftar. Silakan gunakan email lain atau beralih ke tab Masuk.' };
  }

  const newUserId = `user-${params.role.substring(0, 4)}-${Date.now()}`;
  const newUser: User = {
    id: newUserId,
    nama: params.nama,
    email: params.email,
    password: params.password || 'password123',
    role: params.role,
    avatarUrl:
      params.role === 'perusahaan'
        ? 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=150&auto=format&fit=crop&q=80'
        : params.role === 'siswa_sma'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
    isBlocked: false,
  };

  users.push(newUser);
  setItem(STORAGE_KEYS.USERS, users);

  // Initialize Role Specific Profile
  if (params.role === 'mahasiswa') {
    const studentProfiles = getItem<Record<string, StudentProfile>>(STORAGE_KEYS.STUDENT_PROFILES, {});
    studentProfiles[newUserId] = {
      userId: newUserId,
      nama: params.nama,
      universitas: params.universitas || 'Universitas Indonesia',
      jurusan: params.jurusan || 'Teknik Informatika',
      semester: params.semester || 5,
      jenjang: 'mahasiswa',
      noHp: params.noHp || '081234567890',
      fotoUrl: newUser.avatarUrl || '',
      cvUrl: 'https://example.com/cv.pdf',
      cvFileName: `CV_${params.nama.replace(/\s+/g, '_')}.pdf`,
      skills: ['Problem Solving', 'Teamwork', 'Communication'],
      bio: 'Mahasiswa yang antusias mencari pengalaman magang baru.',
      completedInternships: [],
    };
    setItem(STORAGE_KEYS.STUDENT_PROFILES, studentProfiles);
  } else if (params.role === 'siswa_sma') {
    const studentProfiles = getItem<Record<string, StudentProfile>>(STORAGE_KEYS.STUDENT_PROFILES, {});
    studentProfiles[newUserId] = {
      userId: newUserId,
      nama: params.nama,
      universitas: params.namaSekolah || params.universitas || 'SMK Negeri 1 Jakarta',
      namaSekolah: params.namaSekolah || params.universitas || 'SMK Negeri 1 Jakarta',
      jurusan: params.jurusan || 'Rekayasa Perangkat Lunak (RPL)',
      semester: params.semester || 11,
      kelas: params.kelas || 'Kelas XI (11) SMK',
      jenjang: 'siswa_sma',
      nisn: params.nisn || '0061298451',
      guruPembimbing: params.guruPembimbing || 'Drs. Bambang Hidayat, M.Kom',
      kontakGuru: params.kontakGuru || '081298765432',
      noHp: params.noHp || '081234567890',
      fotoUrl: newUser.avatarUrl || '',
      cvUrl: 'https://example.com/cv-siswa.pdf',
      cvFileName: `CV_PKL_${params.nama.replace(/\s+/g, '_')}.pdf`,
      skills: ['Disiplin Waktu', 'Kerja Sama Tim', 'Komunikasi Ramah', 'Penggunaan Komputer'],
      bio: 'Siswa SMA/SMK yang antusias mengikuti program magang atau PKL resmi industri.',
      completedInternships: [],
    };
    setItem(STORAGE_KEYS.STUDENT_PROFILES, studentProfiles);
  } else if (params.role === 'perusahaan') {
    const companyProfiles = getItem<Record<string, CompanyProfile>>(STORAGE_KEYS.COMPANY_PROFILES, {});
    companyProfiles[newUserId] = {
      userId: newUserId,
      namaPerusahaan: params.namaPerusahaan || params.nama,
      logoUrl: newUser.avatarUrl || '',
      deskripsi: 'Perusahaan mitra pencari talenta muda terbaik Indonesia.',
      industri: params.industri || 'Teknologi Informasi',
      alamat: params.alamat || 'Jl. Jendral Sudirman No. 10',
      kota: params.kota || 'Jakarta',
      website: params.website || 'https://example.com',
      statusVerifikasi: 'menunggu', // Default status waiting for admin
      createdAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.COMPANY_PROFILES, companyProfiles);

    // Notify admin
    addNotification({
      userId: 'user-admin-1',
      judul: 'Pendaftaran Mitra Perusahaan Baru',
      pesan: `Perusahaan "${params.namaPerusahaan || params.nama}" telah mendaftar dan membutuhkan verifikasi profil.`,
      type: 'verification',
      linkTarget: 'verify-companies',
    });
  }

  logActivity({
    userId: newUserId,
    userName: params.nama,
    userRole: params.role,
    action: 'REGISTRASI_PENGGUNA',
    details: `Pengguna mendaftar sebagai ${params.role.toUpperCase()}: ${params.email}`,
  });

  return { success: true, user: newUser };
}

export function loginUser(email: string, expectedRole?: UserRole): { success: boolean; user?: User; error?: string } {
  const users = getUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) {
    return { success: false, error: 'Email tidak ditemukan dalam sistem.' };
  }
  if (user.isBlocked) {
    return { success: false, error: 'Akun Anda telah dinonaktifkan oleh Admin. Hubungi tim support.' };
  }

  // Khusus Admin: hanya boleh untuk adamvkedua2@gmail.com
  if (expectedRole === 'admin' || user.role === 'admin') {
    if (user.email.toLowerCase() !== SYSTEM_ADMIN_EMAIL.toLowerCase()) {
      return {
        success: false,
        error: `Akses Ditolak: Hak akses Admin hanya diberikan khusus untuk ${SYSTEM_ADMIN_EMAIL}.`,
      };
    }
  }

  // Jika pengguna memilih peran tertentu di menu login, pastikan sesuai
  if (expectedRole && expectedRole !== user.role) {
    const roleLabel =
      user.role === 'siswa_sma'
        ? 'Siswa SMA/SMK'
        : user.role === 'mahasiswa'
        ? 'Mahasiswa'
        : user.role === 'perusahaan'
        ? 'Perusahaan Mitra'
        : 'Admin';
    return {
      success: false,
      error: `Akun ini terdaftar sebagai "${roleLabel}". Silakan pilih opsi "${roleLabel}" untuk masuk.`,
    };
  }

  setCurrentUser(user);
  return { success: true, user };
}

// --- Profiles ---
export function getStudentProfile(userId: string): StudentProfile | null {
  const profiles = getItem<Record<string, StudentProfile>>(STORAGE_KEYS.STUDENT_PROFILES, INITIAL_STUDENT_PROFILES);
  return profiles[userId] || null;
}

export function saveStudentProfile(profile: StudentProfile): void {
  const profiles = getItem<Record<string, StudentProfile>>(STORAGE_KEYS.STUDENT_PROFILES, INITIAL_STUDENT_PROFILES);
  profiles[profile.userId] = profile;
  setItem(STORAGE_KEYS.STUDENT_PROFILES, profiles);
  syncStudentProfileToFirestore(profile).catch((err) => console.warn('Sync student profile notice:', err));

  // Update user name and avatar if changed
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === profile.userId);
  if (idx !== -1) {
    users[idx].nama = profile.nama;
    if (profile.fotoUrl) users[idx].avatarUrl = profile.fotoUrl;
    setItem(STORAGE_KEYS.USERS, users);

    const curr = getCurrentUser();
    if (curr?.id === profile.userId) {
      curr.nama = profile.nama;
      if (profile.fotoUrl) curr.avatarUrl = profile.fotoUrl;
      setCurrentUser(curr);
    }
  }
}

export function getCompanyProfile(userId: string): CompanyProfile | null {
  const profiles = getItem<Record<string, CompanyProfile>>(STORAGE_KEYS.COMPANY_PROFILES, INITIAL_COMPANY_PROFILES);
  return profiles[userId] || null;
}

export function getAllCompanyProfiles(): CompanyProfile[] {
  const map = getItem<Record<string, CompanyProfile>>(STORAGE_KEYS.COMPANY_PROFILES, INITIAL_COMPANY_PROFILES);
  return Object.values(map);
}

export function saveCompanyProfile(profile: CompanyProfile): void {
  const profiles = getItem<Record<string, CompanyProfile>>(STORAGE_KEYS.COMPANY_PROFILES, INITIAL_COMPANY_PROFILES);
  profiles[profile.userId] = profile;
  setItem(STORAGE_KEYS.COMPANY_PROFILES, profiles);
  syncCompanyProfileToFirestore(profile).catch((err) => console.warn('Sync company profile notice:', err));
}

export function verifyCompany(companyUserId: string, status: CompanyVerificationStatus, reason?: string): void {
  const profiles = getItem<Record<string, CompanyProfile>>(STORAGE_KEYS.COMPANY_PROFILES, INITIAL_COMPANY_PROFILES);
  if (!profiles[companyUserId]) return;

  profiles[companyUserId].statusVerifikasi = status;
  if (reason) profiles[companyUserId].alasanPenolakan = reason;
  setItem(STORAGE_KEYS.COMPANY_PROFILES, profiles);
  syncCompanyProfileToFirestore(profiles[companyUserId]).catch((err) => console.warn('Sync company verification notice:', err));

  // Notify company
  addNotification({
    userId: companyUserId,
    judul: status === 'terverifikasi' ? 'Selamat! Akun Perusahaan Terverifikasi' : 'Status Verifikasi Perusahaan',
    pesan:
      status === 'terverifikasi'
        ? 'Profil perusahaan Anda telah disetujui oleh Admin. Anda sekarang dapat menerbitkan lowongan magang.'
        : `Verifikasi profil perusahaan Anda ditolak: ${reason || 'Silakan lengkapi data resmi perusahaan Anda.'}`,
    type: 'verification',
  });

  const curr = getCurrentUser();
  logActivity({
    userId: curr?.id || 'admin',
    userName: curr?.nama || 'Admin',
    userRole: 'admin',
    action: status === 'terverifikasi' ? 'APPROVE_PERUSAHAAN' : 'REJECT_PERUSAHAAN',
    details: `${status === 'terverifikasi' ? 'Menyetujui' : 'Menolak'} verifikasi perusahaan ${profiles[companyUserId].namaPerusahaan}`,
  });
}

// --- Jobs (Lowongan) ---
export function getJobs(): JobListing[] {
  return getItem<JobListing[]>(STORAGE_KEYS.JOBS, INITIAL_JOBS);
}

export function getJobById(id: string): JobListing | undefined {
  return getJobs().find((j) => j.id === id);
}

export function getJobsByCompany(companyId: string): JobListing[] {
  return getJobs().filter((j) => j.companyId === companyId);
}

export function saveJob(job: JobListing): void {
  const jobs = getJobs();
  const index = jobs.findIndex((j) => j.id === job.id);
  const curr = getCurrentUser();

  if (index !== -1) {
    jobs[index] = job;
    logActivity({
      userId: curr?.id || job.companyId,
      userName: curr?.nama || job.companyName,
      userRole: curr?.role || 'perusahaan',
      action: 'UPDATE_LOWONGAN',
      details: `Memperbarui detail lowongan: ${job.judul}`,
    });
  } else {
    jobs.unshift(job);
    logActivity({
      userId: curr?.id || job.companyId,
      userName: curr?.nama || job.companyName,
      userRole: curr?.role || 'perusahaan',
      action: 'BUAT_LOWONGAN',
      details: `Menerbitkan lowongan baru: ${job.judul}`,
    });

    // Notify admin
    addNotification({
      userId: 'user-admin-1',
      judul: 'Lowongan Baru Diterbitkan',
      pesan: `${job.companyName} menerbitkan lowongan "${job.judul}".`,
      type: 'system',
      linkTarget: 'moderate-jobs',
    });
  }

  setItem(STORAGE_KEYS.JOBS, jobs);
  syncJobToFirestore(job).catch((err) => console.warn('Sync job notice:', err));
}

export function deleteJob(jobId: string): void {
  const jobs = getJobs();
  const job = jobs.find((j) => j.id === jobId);
  const filtered = jobs.filter((j) => j.id !== jobId);
  setItem(STORAGE_KEYS.JOBS, filtered);
  deleteJobFromFirestore(jobId).catch((err) => console.warn('Delete job notice:', err));

  if (job) {
    const curr = getCurrentUser();
    logActivity({
      userId: curr?.id || 'system',
      userName: curr?.nama || 'Perusahaan',
      userRole: curr?.role || 'perusahaan',
      action: 'HAPUS_LOWONGAN',
      details: `Menghapus lowongan: ${job.judul}`,
    });
  }
}

export function updateJobStatus(jobId: string, status: JobStatus, alasan?: string): void {
  const jobs = getJobs();
  const index = jobs.findIndex((j) => j.id === jobId);
  if (index === -1) return;

  jobs[index].status = status;
  if (alasan) jobs[index].alasanModerasi = alasan;
  setItem(STORAGE_KEYS.JOBS, jobs);
  syncJobToFirestore(jobs[index]).catch((err) => console.warn('Sync job status notice:', err));

  const curr = getCurrentUser();
  logActivity({
    userId: curr?.id || 'admin',
    userName: curr?.nama || 'Admin',
    userRole: curr?.role || 'admin',
    action: 'MODERASI_LOWONGAN',
    details: `Mengubah status lowongan "${jobs[index].judul}" menjadi ${status.toUpperCase()}`,
  });

  // Notify company
  addNotification({
    userId: jobs[index].companyId,
    judul: `Status Lowongan: ${jobs[index].judul}`,
    pesan: `Lowongan Anda telah diperbarui statusnya menjadi: ${status.toUpperCase()}${alasan ? ` (Catatan: ${alasan})` : ''}`,
    type: 'system',
  });
}

// --- Applications (Lamaran) ---
export function getApplications(): Application[] {
  return getItem<Application[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
}

export function getApplicationsByStudent(studentId: string): Application[] {
  return getApplications().filter((a) => a.studentId === studentId);
}

export function getApplicationsByJob(jobId: string): Application[] {
  return getApplications().filter((a) => a.lowonganId === jobId);
}

export function getApplicationsByCompany(companyId: string): Application[] {
  const jobs = getJobsByCompany(companyId);
  const jobIds = new Set(jobs.map((j) => j.id));
  return getApplications().filter((a) => jobIds.has(a.lowonganId));
}

export function submitApplication(params: {
  lowonganId: string;
  studentId: string;
  cvUrl?: string;
  cvFileName?: string;
  motivationLetter: string;
  portfolioLink?: string;
}): { success: boolean; error?: string; application?: Application } {
  const applications = getApplications();
  const hasApplied = applications.some(
    (a) => a.lowonganId === params.lowonganId && a.studentId === params.studentId
  );

  if (hasApplied) {
    return { success: false, error: 'Anda sudah pernah mengajukan lamaran untuk posisi magang ini.' };
  }

  const job = getJobById(params.lowonganId);
  const studentProfile = getStudentProfile(params.studentId);
  const user = getUserById(params.studentId);

  if (!job) {
    return { success: false, error: 'Lowongan magang tidak ditemukan.' };
  }

  const newApp: Application = {
    id: `app-${Date.now()}`,
    lowonganId: params.lowonganId,
    studentId: params.studentId,
    studentName: studentProfile?.nama || user?.nama || 'Mahasiswa',
    studentEmail: user?.email || '',
    studentPhone: studentProfile?.noHp || '',
    studentUniversity: studentProfile?.universitas || 'Universitas Indonesia',
    studentMajor: studentProfile?.jurusan || 'Teknik Informatika',
    studentSkills: studentProfile?.skills || ['React', 'Problem Solving', 'Teamwork'],
    studentAvatar: studentProfile?.fotoUrl || user?.avatarUrl,
    cvUrl: params.cvUrl || studentProfile?.cvUrl || 'https://example.com/cv.pdf',
    cvFileName: params.cvFileName || studentProfile?.cvFileName || 'CV_Mahasiswa.pdf',
    motivationLetter: params.motivationLetter,
    portfolioLink: params.portfolioLink || studentProfile?.portfolioUrl || '',
    status: 'menunggu',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  applications.unshift(newApp);
  setItem(STORAGE_KEYS.APPLICATIONS, applications);
  syncApplicationToFirestore(newApp).catch((err) => console.warn('Sync application notice:', err));

  // Notify company
  addNotification({
    userId: job.companyId,
    judul: 'Pelamar Baru Diterima!',
    pesan: `${newApp.studentName} (${newApp.studentUniversity}) telah melamar posisi "${job.judul}".`,
    type: 'job_alert',
    linkTarget: 'applicants',
  });

  // Notify student
  addNotification({
    userId: params.studentId,
    judul: 'Lamaran Berhasil Terkirim',
    pesan: `Lamaran Anda untuk "${job.judul}" di ${job.companyName} telah berhasil dikirimkan. Pantau status seleksi di Lamaran Saya.`,
    type: 'status_update',
    linkTarget: 'applications',
  });

  logActivity({
    userId: params.studentId,
    userName: newApp.studentName,
    userRole: 'mahasiswa',
    action: 'SUBMIT_LAMARAN',
    details: `Melamar posisi ${job.judul} di ${job.companyName}`,
  });

  return { success: true, application: newApp };
}

export function updateApplicationStatus(
  applicationId: string,
  newStatus: ApplicationStatus,
  catatanInternal?: string,
  jadwalInterview?: string
): void {
  const applications = getApplications();
  const index = applications.findIndex((a) => a.id === applicationId);
  if (index === -1) return;

  const app = applications[index];
  const oldStatus = app.status;
  app.status = newStatus;
  app.updatedAt = new Date().toISOString();
  if (catatanInternal !== undefined) app.catatanInternal = catatanInternal;
  if (jadwalInterview !== undefined) app.jadwalInterview = jadwalInterview;

  setItem(STORAGE_KEYS.APPLICATIONS, applications);
  syncApplicationToFirestore(app).catch((err) => console.warn('Sync update application notice:', err));

  const job = getJobById(app.lowonganId);
  const curr = getCurrentUser();

  // Notify Student
  const statusLabels: Record<ApplicationStatus, string> = {
    menunggu: 'Menunggu Review',
    direview: 'Sedang Diproses & Direview',
    interview: 'Tahap Wawancara (Interview)',
    diterima: 'Selamat! Anda DITERIMA Magang',
    ditolak: 'Lamaran Belum Sesuai',
  };

  let notifMessage = `Status lamaran Anda untuk "${job?.judul || 'Lowongan'}" kini menjadi: ${statusLabels[newStatus]}.`;
  if (newStatus === 'interview' && jadwalInterview) {
    notifMessage += ` Jadwal Interview: ${jadwalInterview}`;
  }
  if (catatanInternal) {
    notifMessage += ` Catatan: "${catatanInternal}"`;
  }

  addNotification({
    userId: app.studentId,
    judul: `Pembaruan Status Lamaran: ${statusLabels[newStatus]}`,
    pesan: notifMessage,
    type: 'status_update',
    linkTarget: 'applications',
  });

  logActivity({
    userId: curr?.id || 'company',
    userName: curr?.nama || 'Perusahaan',
    userRole: curr?.role || 'perusahaan',
    action: 'UPDATE_STATUS_PELAMAR',
    details: `Mengubah status lamaran ${app.studentName} dari ${oldStatus.toUpperCase()} ke ${newStatus.toUpperCase()}`,
  });
}

// --- Bookmarks ---
export function getBookmarks(studentId: string): string[] {
  const bookmarks = getItem<Record<string, string[]>>(STORAGE_KEYS.BOOKMARKS, {});
  return bookmarks[studentId] || [];
}

export function toggleBookmark(studentId: string, jobId: string): boolean {
  const bookmarks = getItem<Record<string, string[]>>(STORAGE_KEYS.BOOKMARKS, {});
  const list = bookmarks[studentId] || [];
  const index = list.indexOf(jobId);
  let isBookmarked = false;

  if (index !== -1) {
    list.splice(index, 1);
    isBookmarked = false;
  } else {
    list.push(jobId);
    isBookmarked = true;
  }

  bookmarks[studentId] = list;
  setItem(STORAGE_KEYS.BOOKMARKS, bookmarks);
  return isBookmarked;
}

// --- Notifications ---
export function getNotifications(userId: string): InAppNotification[] {
  const notifs = getItem<InAppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  return notifs.filter((n) => n.userId === userId);
}

export function addNotification(params: {
  userId: string;
  judul: string;
  pesan: string;
  type?: 'status_update' | 'verification' | 'job_alert' | 'system';
  linkTarget?: string;
}): void {
  const notifs = getItem<InAppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  const newNotif: InAppNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    userId: params.userId,
    judul: params.judul,
    pesan: params.pesan,
    isRead: false,
    type: params.type || 'system',
    linkTarget: params.linkTarget,
    createdAt: new Date().toISOString(),
  };
  notifs.unshift(newNotif);
  setItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
  syncNotificationToFirestore(newNotif).catch((err) => console.warn('Sync notification notice:', err));
}

export function markNotificationAsRead(id: string): void {
  const notifs = getItem<InAppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  const target = notifs.find((n) => n.id === id);
  if (target) {
    target.isRead = true;
    setItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }
}

export function markAllNotificationsAsRead(userId: string): void {
  const notifs = getItem<InAppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  notifs.forEach((n) => {
    if (n.userId === userId) n.isRead = true;
  });
  setItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
}

// --- Activity Logs ---
export function getActivityLogs(): ActivityLog[] {
  return getItem<ActivityLog[]>(STORAGE_KEYS.ACTIVITY_LOGS, INITIAL_ACTIVITY_LOGS);
}

export function logActivity(params: {
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
}): void {
  const logs = getActivityLogs();
  const newLog: ActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    userId: params.userId,
    userName: params.userName,
    userRole: params.userRole,
    action: params.action,
    details: params.details,
    timestamp: new Date().toISOString(),
  };
  logs.unshift(newLog);
  // Keep last 100 logs
  if (logs.length > 100) logs.pop();
  setItem(STORAGE_KEYS.ACTIVITY_LOGS, logs);
  syncActivityLogToFirestore(newLog).catch((err) => console.warn('Sync activity log notice:', err));
}

// --- Dark Mode ---
export function getDarkMode(): boolean {
  return getItem<boolean>(STORAGE_KEYS.DARK_MODE, false);
}

export function setDarkMode(value: boolean): void {
  setItem(STORAGE_KEYS.DARK_MODE, value);
  if (value) {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
  }
}

// --- PKL Logbook Functions (Khusus Siswa SMA / SMK & Magang) ---
export function getPklLogs(studentId?: string): PklLogbookEntry[] {
  const logs = getItem<PklLogbookEntry[]>(STORAGE_KEYS.PKL_LOGS, INITIAL_PKL_LOGS);
  if (studentId) {
    return logs.filter((l) => l.studentId === studentId);
  }
  return logs;
}

export function savePklLog(log: PklLogbookEntry): void {
  const logs = getPklLogs();
  const index = logs.findIndex((l) => l.id === log.id);
  if (index !== -1) {
    logs[index] = log;
  } else {
    logs.unshift(log);
  }
  setItem(STORAGE_KEYS.PKL_LOGS, logs);
}

export function updatePklLogStatus(logId: string, status: 'disetujui' | 'revisi', catatanMentor?: string): void {
  const logs = getPklLogs();
  const index = logs.findIndex((l) => l.id === logId);
  if (index !== -1) {
    logs[index].statusVerifikasi = status;
    if (catatanMentor) logs[index].catatanMentor = catatanMentor;
    setItem(STORAGE_KEYS.PKL_LOGS, logs);
  }
}

export function deletePklLog(logId: string): void {
  const logs = getPklLogs();
  const filtered = logs.filter((l) => l.id !== logId);
  setItem(STORAGE_KEYS.PKL_LOGS, filtered);
}
