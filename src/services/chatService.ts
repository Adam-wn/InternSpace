import { ChatMessage, Conversation, User, UserRole } from '../types';
import {
  getConversations,
  saveConversation,
  getChatMessages,
  saveChatMessage,
  markConversationAsRead,
  getCompanyProfile,
  getStudentProfile,
  getUserById,
  SYSTEM_ADMIN_EMAIL,
} from './storage';

/**
 * Fetch all conversations relevant for the given user role.
 * - Admin sees ALL conversations in system.
 * - Perusahaan sees conversations directed to their companyId.
 * - Mahasiswa / Siswa sees conversations where they are the studentId.
 */
export function getConversationsForUser(userId: string, role: UserRole): Conversation[] {
  const all = getConversations();

  if (role === 'admin') {
    return all.sort(
      (a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime()
    );
  }

  if (role === 'perusahaan') {
    return all
      .filter((c) => c.companyId === userId)
      .sort((a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());
  }

  return all
    .filter((c) => c.studentId === userId)
    .sort((a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());
}

/**
 * Admin-only: view all conversations with full audit metadata.
 */
export function getAllConversationsForAdmin(adminUser: User): Conversation[] {
  if (adminUser.email.toLowerCase() !== SYSTEM_ADMIN_EMAIL.toLowerCase() || adminUser.role !== 'admin') {
    console.warn('Unauthorized admin chat access attempted');
    return [];
  }
  return getConversations().sort(
    (a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime()
  );
}

/**
 * Retrieve or create a conversation between a student and a company.
 */
export function getOrCreateConversation(params: {
  companyId: string;
  studentUser: User;
  jobId?: string;
  jobTitle?: string;
}): Conversation {
  const { companyId, studentUser, jobId, jobTitle } = params;
  const conversations = getConversations();

  const existing = conversations.find(
    (c) => c.companyId === companyId && c.studentId === studentUser.id
  );

  if (existing) {
    if (jobId && !existing.jobId) {
      existing.jobId = jobId;
      existing.jobTitle = jobTitle;
      saveConversation(existing);
    }
    return existing;
  }

  // Create new conversation
  const compProfile = getCompanyProfile(companyId);
  const compUser = getUserById(companyId);
  const studProfile = getStudentProfile(studentUser.id);

  const companyName = compProfile?.namaPerusahaan || compUser?.nama || 'Perusahaan Mitra';
  const companyLogo =
    compProfile?.logoUrl ||
    compUser?.avatarUrl ||
    'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=120&auto=format&fit=crop&q=80';

  const instituteName =
    studentUser.role === 'siswa_sma'
      ? `${studProfile?.namaSekolah || studProfile?.universitas || 'SMK/SMA'} (${studProfile?.jurusan || 'Kejuruan'})`
      : `${studProfile?.universitas || 'Perguruan Tinggi'} (${studProfile?.jurusan || 'Jurusan'})`;

  const newConv: Conversation = {
    id: `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    companyId,
    companyName,
    companyLogo,
    companyEmail: compProfile?.emailKontak || compUser?.email || '',
    studentId: studentUser.id,
    studentName: studentUser.nama,
    studentAvatar: studentUser.avatarUrl,
    studentRole: studentUser.role,
    studentInstitute: instituteName,
    lastMessage: 'Percakapan baru dimulai',
    lastMessageTimestamp: new Date().toISOString(),
    unreadCountCompany: 0,
    unreadCountStudent: 0,
    jobId,
    jobTitle,
  };

  saveConversation(newConv);
  return newConv;
}

/**
 * Send a message within a conversation.
 * If sent by student to company, optionally triggers a helpful smart instant auto-reply after 1.2s.
 */
export function sendMessage(params: {
  conversationId: string;
  sender: User;
  text: string;
  autoReply?: boolean;
}): ChatMessage {
  const { conversationId, sender, text, autoReply = true } = params;
  const conv = getConversations().find((c) => c.id === conversationId);

  if (!conv) {
    throw new Error('Percakapan tidak ditemukan');
  }

  const isCompany = sender.role === 'perusahaan';
  const recipientId = isCompany ? conv.studentId : conv.companyId;
  const recipientName = isCompany ? conv.studentName : conv.companyName;

  const newMsg: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    conversationId,
    senderId: sender.id,
    senderName: sender.nama,
    senderRole: sender.role,
    senderAvatar: sender.avatarUrl,
    recipientId,
    recipientName,
    companyId: conv.companyId,
    companyName: conv.companyName,
    studentId: conv.studentId,
    studentName: conv.studentName,
    studentInstitute: conv.studentInstitute,
    jobId: conv.jobId,
    jobTitle: conv.jobTitle,
    text: text.trim(),
    timestamp: new Date().toISOString(),
    isRead: false,
  };

  saveChatMessage(newMsg);

  // If a student sent a message to the company, simulate a professional response from company HR
  if (!isCompany && autoReply) {
    scheduleCompanyAutoReply(conv, text);
  }

  return newMsg;
}

/**
 * Smart instant reply generator for seamless candidate-company engagement.
 */
function scheduleCompanyAutoReply(conv: Conversation, studentText: string): void {
  setTimeout(() => {
    // Generate context-aware response based on student question
    const lower = studentText.toLowerCase();
    let replyText = `Halo ${conv.studentName}! Terima kasih sudah menghubungi tim rekrutmen ${conv.companyName}. `;

    if (lower.includes('interview') || lower.includes('wawancara')) {
      replyText += `Informasi jadwal interview teknis/HR akan dikirimkan langsung ke email Anda dan tertera di tab Lamaran Saya setelah berkas Anda ditinjau oleh tim seleksi kami.`;
    } else if (lower.includes('pkl') || lower.includes('surat') || lower.includes('sekolah') || lower.includes('smk')) {
      replyText += `Untuk program magang PKL siswa, kami menerima surat rekomendasi resmi dan surat izin orang tua dalam format PDF. Pastikan data rapor/NISN Anda sudah lengkap.`;
    } else if (lower.includes('upah') || lower.includes('gaji') || lower.includes('uang saku') || lower.includes('kompensasi')) {
      replyText += `Kompensasi bulanan untuk lowongan ${conv.jobTitle || 'magang'} kami berikan sesuai dengan nominal yang tertera pada katalog resmi dan ditransfer setiap akhir bulan.`;
    } else if (lower.includes('portofolio') || lower.includes('cv') || lower.includes('syarat')) {
      replyText += `Kami sangat menyukai portofolio proyek riil atau karya mandiri yang Anda cantumkan di profil InternSpace Anda. Tim kami akan segera meninjau profil lengkap Anda!`;
    } else {
      replyText += `Pesan Anda mengenai "${conv.jobTitle || 'program magang'}" telah kami catat. HR Talent Specialist kami akan segera memberikan respons detail dalam jam kerja berikutnya.`;
    }

    const replyMsg: ChatMessage = {
      id: `msg-auto-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      conversationId: conv.id,
      senderId: conv.companyId,
      senderName: `${conv.companyName} Talent Acquisition`,
      senderRole: 'perusahaan',
      senderAvatar: conv.companyLogo,
      recipientId: conv.studentId,
      recipientName: conv.studentName,
      companyId: conv.companyId,
      companyName: conv.companyName,
      studentId: conv.studentId,
      studentName: conv.studentName,
      studentInstitute: conv.studentInstitute,
      jobId: conv.jobId,
      jobTitle: conv.jobTitle,
      text: replyText,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    saveChatMessage(replyMsg);
    window.dispatchEvent(new Event('internspace_data_changed'));
  }, 1200);
}

export { markConversationAsRead };
