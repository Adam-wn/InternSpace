import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { db, auth, googleProvider, handleFirestoreError, OperationType } from './firebase';
import {
  User,
  StudentProfile,
  CompanyProfile,
  JobListing,
  Application,
  InAppNotification,
  ActivityLog,
  UserRole,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_STUDENT_PROFILES,
  INITIAL_COMPANY_PROFILES,
  INITIAL_JOBS,
  INITIAL_APPLICATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITY_LOGS,
} from '../data/mockData';

// Track sync status
let isFirestoreInitialized = false;

/**
 * Seed initial data to Firestore if collections are empty.
 */
export async function seedFirestoreIfEmpty(): Promise<void> {
  if (isFirestoreInitialized) return;
  try {
    const jobsRef = collection(db, 'jobs');
    const jobsSnap = await getDocs(jobsRef).catch((err) => {
      handleFirestoreError(err, OperationType.GET, 'jobs');
    });

    if (jobsSnap.empty) {
      console.log('Seeding initial data into Firestore...');
      // Seed initial jobs
      for (const job of INITIAL_JOBS) {
        await setDoc(doc(db, 'jobs', job.id), job).catch((err) => {
          handleFirestoreError(err, OperationType.WRITE, `jobs/${job.id}`);
        });
      }

      // Seed initial users
      for (const user of INITIAL_USERS) {
        await setDoc(doc(db, 'users', user.id), user).catch((err) => {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.id}`);
        });
      }

      // Seed initial company profiles
      for (const [userId, profile] of Object.entries(INITIAL_COMPANY_PROFILES)) {
        await setDoc(doc(db, 'companyProfiles', userId), profile).catch((err) => {
          handleFirestoreError(err, OperationType.WRITE, `companyProfiles/${userId}`);
        });
      }

      // Seed initial student profiles
      for (const [userId, profile] of Object.entries(INITIAL_STUDENT_PROFILES)) {
        await setDoc(doc(db, 'studentProfiles', userId), profile).catch((err) => {
          handleFirestoreError(err, OperationType.WRITE, `studentProfiles/${userId}`);
        });
      }

      // Seed initial applications
      for (const app of INITIAL_APPLICATIONS) {
        await setDoc(doc(db, 'applications', app.id), app).catch((err) => {
          handleFirestoreError(err, OperationType.WRITE, `applications/${app.id}`);
        });
      }

      // Seed initial notifications
      for (const notif of INITIAL_NOTIFICATIONS) {
        await setDoc(doc(db, 'notifications', notif.id), notif).catch((err) => {
          handleFirestoreError(err, OperationType.WRITE, `notifications/${notif.id}`);
        });
      }

      // Seed initial activity logs
      for (const log of INITIAL_ACTIVITY_LOGS) {
        await setDoc(doc(db, 'activityLogs', log.id), log).catch((err) => {
          handleFirestoreError(err, OperationType.WRITE, `activityLogs/${log.id}`);
        });
      }
      console.log('Firestore seeded successfully.');
    }
    isFirestoreInitialized = true;
  } catch (error) {
    console.warn('Seed Firestore check or population encountered non-blocking note:', error);
  }
}

/**
 * Google Sign In with Firebase Authentication
 */
export async function signInWithGoogle(preferredRole: UserRole = 'mahasiswa'): Promise<User> {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    const fbUser = cred.user;

    const userDocRef = doc(db, 'users', fbUser.uid);
    const userDoc = await getDoc(userDocRef).catch((err) => {
      handleFirestoreError(err, OperationType.GET, `users/${fbUser.uid}`);
    });

    let appUser: User;

    // Check if user already exists in Firestore
    if (userDoc && userDoc.exists()) {
      appUser = userDoc.data() as User;
    } else {
      // Determine role: runtime user email or explicit role
      const isAdminEmail = fbUser.email?.toLowerCase() === 'adamvkedua2@gmail.com';
      const role: UserRole = isAdminEmail ? 'admin' : preferredRole;

      appUser = {
        id: fbUser.uid,
        nama: fbUser.displayName || 'Pengguna Baru',
        email: fbUser.email || '',
        role: role,
        avatarUrl: fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
        isBlocked: false,
        statusAktif: 'aktif',
      };

      await setDoc(userDocRef, appUser).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, `users/${fbUser.uid}`);
      });

      // Initialize corresponding profile in Firestore
      if (role === 'mahasiswa') {
        const studentProfile: StudentProfile = {
          userId: fbUser.uid,
          nama: appUser.nama,
          universitas: 'Universitas Indonesia',
          jurusan: 'Sistem Informasi',
          semester: 5,
          noHp: '081234567890',
          fotoUrl: appUser.avatarUrl || '',
          cvUrl: 'https://example.com/cv.pdf',
          cvFileName: `CV_${appUser.nama.replace(/\s+/g, '_')}.pdf`,
          skills: ['Problem Solving', 'Data Analysis', 'Teamwork'],
          bio: 'Mahasiswa aktif bersemangat mengembangkan karir profesional.',
          completedInternships: [],
        };
        await setDoc(doc(db, 'studentProfiles', fbUser.uid), studentProfile).catch((err) => {
          handleFirestoreError(err, OperationType.WRITE, `studentProfiles/${fbUser.uid}`);
        });
      } else if (role === 'perusahaan') {
        const companyProfile: CompanyProfile = {
          userId: fbUser.uid,
          namaPerusahaan: `${appUser.nama} Digital`,
          logoUrl: appUser.avatarUrl || '',
          deskripsi: 'Perusahaan mitra inovatif pencari talenta magang terbaik.',
          industri: 'Teknologi Informasi & Digital',
          alamat: 'Jl. Jendral Sudirman No. 45',
          kota: 'Jakarta',
          website: 'https://example.com',
          statusVerifikasi: 'menunggu',
          createdAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'companyProfiles', fbUser.uid), companyProfile).catch((err) => {
          handleFirestoreError(err, OperationType.WRITE, `companyProfiles/${fbUser.uid}`);
        });
      }
    }

    return appUser;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

/**
 * Sign out from Firebase
 */
export async function logoutFromFirebase(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.warn('Sign out warning:', error);
  }
}

/**
 * Subscribe to realtime jobs from Firestore
 */
export function subscribeJobs(callback: (jobs: JobListing[]) => void): () => void {
  const q = collection(db, 'jobs');
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const jobs: JobListing[] = [];
      snapshot.forEach((doc) => {
        jobs.push(doc.data() as JobListing);
      });
      callback(jobs);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'jobs');
    }
  );
  return unsubscribe;
}

/**
 * Subscribe to realtime applications from Firestore
 */
export function subscribeApplications(callback: (apps: Application[]) => void): () => void {
  const q = collection(db, 'applications');
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const apps: Application[] = [];
      snapshot.forEach((doc) => {
        apps.push(doc.data() as Application);
      });
      callback(apps);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'applications');
    }
  );
  return unsubscribe;
}

/**
 * Save / Update Job in Firestore
 */
export async function syncJobToFirestore(job: JobListing): Promise<void> {
  try {
    await setDoc(doc(db, 'jobs', job.id), job);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `jobs/${job.id}`);
  }
}

/**
 * Delete Job in Firestore
 */
export async function deleteJobFromFirestore(jobId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'jobs', jobId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `jobs/${jobId}`);
  }
}

/**
 * Save / Update Application in Firestore
 */
export async function syncApplicationToFirestore(app: Application): Promise<void> {
  try {
    await setDoc(doc(db, 'applications', app.id), app);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `applications/${app.id}`);
  }
}

/**
 * Save / Update Notification in Firestore
 */
export async function syncNotificationToFirestore(notif: InAppNotification): Promise<void> {
  try {
    await setDoc(doc(db, 'notifications', notif.id), notif);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `notifications/${notif.id}`);
  }
}

/**
 * Save / Update Student Profile in Firestore
 */
export async function syncStudentProfileToFirestore(profile: StudentProfile): Promise<void> {
  try {
    await setDoc(doc(db, 'studentProfiles', profile.userId), profile);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `studentProfiles/${profile.userId}`);
  }
}

/**
 * Save / Update Company Profile in Firestore
 */
export async function syncCompanyProfileToFirestore(profile: CompanyProfile): Promise<void> {
  try {
    await setDoc(doc(db, 'companyProfiles', profile.userId), profile);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `companyProfiles/${profile.userId}`);
  }
}

/**
 * Save Activity Log to Firestore
 */
export async function syncActivityLogToFirestore(log: ActivityLog): Promise<void> {
  try {
    await setDoc(doc(db, 'activityLogs', log.id), log);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `activityLogs/${log.id}`);
  }
}
