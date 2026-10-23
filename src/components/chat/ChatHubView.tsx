import React, { useState, useEffect, useRef } from 'react';
import { User, Conversation, ChatMessage } from '../../types';
import {
  getConversationsForUser,
  getOrCreateConversation,
  sendMessage,
  markConversationAsRead,
} from '../../services/chatService';
import { getChatMessages, getStudentProfile, getCompanyProfile } from '../../services/storage';
import {
  Search,
  Send,
  MessageSquare,
  Building2,
  GraduationCap,
  School,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  ChevronLeft,
  Briefcase,
  FileText,
} from 'lucide-react';

interface ChatHubViewProps {
  currentUser: User;
  onNotify?: (message: string, type?: 'success' | 'error' | 'info') => void;
  initialConversationId?: string;
  initialCompanyId?: string;
  initialJobId?: string;
  initialJobTitle?: string;
}

export const ChatHubView: React.FC<ChatHubViewProps> = ({
  currentUser,
  onNotify,
  initialConversationId,
  initialCompanyId,
  initialJobId,
  initialJobTitle,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    getConversationsForUser(currentUser.id, currentUser.role)
  );
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(() => {
    if (initialConversationId) return initialConversationId;
    if (conversations.length > 0) return conversations[0].id;
    return null;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showRightDetails, setShowRightDetails] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // If passed initialCompanyId from job card, find or create conversation
  useEffect(() => {
    if (initialCompanyId && currentUser.role !== 'perusahaan') {
      const conv = getOrCreateConversation({
        companyId: initialCompanyId,
        studentUser: currentUser,
        jobId: initialJobId,
        jobTitle: initialJobTitle,
      });
      setSelectedConversationId(conv.id);
      refreshData();
    }
  }, [initialCompanyId, initialJobId, initialJobTitle, currentUser]);

  const refreshData = () => {
    const updated = getConversationsForUser(currentUser.id, currentUser.role);
    setConversations(updated);
    if (!selectedConversationId && updated.length > 0) {
      setSelectedConversationId(updated[0].id);
    }
  };

  useEffect(() => {
    const handleStorageUpdate = () => {
      refreshData();
    };
    window.addEventListener('internspace_data_changed', handleStorageUpdate);
    return () => {
      window.removeEventListener('internspace_data_changed', handleStorageUpdate);
    };
  }, [currentUser, selectedConversationId]);

  // Mark conversation as read when selected
  useEffect(() => {
    if (selectedConversationId) {
      markConversationAsRead(selectedConversationId, currentUser.role);
    }
  }, [selectedConversationId, currentUser]);

  // Auto scroll to bottom
  const activeMessages = selectedConversationId
    ? getChatMessages(selectedConversationId)
    : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length, selectedConversationId]);

  const activeConv = conversations.find((c) => c.id === selectedConversationId);

  const filteredConversations = conversations.filter((c) => {
    const query = searchQuery.toLowerCase();
    return (
      c.companyName.toLowerCase().includes(query) ||
      c.studentName.toLowerCase().includes(query) ||
      (c.jobTitle && c.jobTitle.toLowerCase().includes(query)) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(query))
    );
  });

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedConversationId) return;

    try {
      setIsSending(true);
      sendMessage({
        conversationId: selectedConversationId,
        sender: currentUser,
        text: inputText,
        autoReply: true,
      });
      setInputText('');
      refreshData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengirim pesan';
      if (onNotify) onNotify(msg, 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickChip = (text: string) => {
    setInputText(text);
  };

  const isCompany = currentUser.role === 'perusahaan';

  // Details data for the right drawer
  const targetStudentProfile = activeConv
    ? getStudentProfile(activeConv.studentId)
    : null;
  const targetCompanyProfile = activeConv
    ? getCompanyProfile(activeConv.companyId)
    : null;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Top Banner / Heading */}
      <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{isCompany ? 'Kotak Masuk Pesan Pelamar' : 'Pesan & Tanya Perusahaan'}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                Online & Terhubung
              </span>
            </h1>
            <p className="text-[11px] text-slate-500">
              {isCompany
                ? 'Jalin komunikasi langsung dengan calon anak magang (Mahasiswa & Siswa SMK/SMA)'
                : 'Kirim pertanyaan seputar lowongan magang atau persiapan PKL langsung ke akun resmi perusahaan'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowRightDetails(!showRightDetails)}
          className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 cursor-pointer px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Info className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {showRightDetails ? 'Sembunyikan Info' : 'Lihat Profil'}
          </span>
        </button>
      </div>

      {/* Main Chat Workspace Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: CONVERSATION LIST */}
        <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/40 dark:bg-slate-900/60 shrink-0">
          {/* Search Bar */}
          <div className="p-3 border-b border-slate-200/80 dark:border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={isCompany ? 'Cari nama pelamar / lowongan...' : 'Cari nama perusahaan...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>Belum ada riwayat pesan yang sesuai.</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === selectedConversationId;
                const unreadCount = isCompany
                  ? conv.unreadCountCompany || 0
                  : conv.unreadCountStudent || 0;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversationId(conv.id)}
                    className={`w-full p-3.5 text-left transition-colors flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-l-4 border-indigo-600'
                        : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={
                          isCompany
                            ? conv.studentAvatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                            : conv.companyLogo ||
                              'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=120&auto=format&fit=crop&q=80'
                        }
                        alt="Avatar"
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 absolute -bottom-0.5 -right-0.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {isCompany ? conv.studentName : conv.companyName}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(conv.lastMessageTimestamp).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {conv.jobTitle && (
                        <div className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 truncate mb-1">
                          Posisi: {conv.jobTitle}
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {conv.lastMessage || 'Mulai percakapan...'}
                        </p>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-black shrink-0">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* MIDDLE COLUMN: ACTIVE CHAT CONVERSATION */}
        {activeConv ? (
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
            {/* Active Thread Header */}
            <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={
                    isCompany
                      ? activeConv.studentAvatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                      : activeConv.companyLogo ||
                        'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=120&auto=format&fit=crop&q=80'
                  }
                  alt="Avatar"
                  className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {isCompany ? activeConv.studentName : activeConv.companyName}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {isCompany
                        ? activeConv.studentRole === 'siswa_sma'
                          ? 'Siswa SMA/SMK'
                          : 'Mahasiswa'
                        : 'Mitra Resmi'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate flex items-center gap-1.5">
                    {isCompany ? (
                      <span>{activeConv.studentInstitute || 'Institusi Pendidikan'}</span>
                    ) : (
                      <span>Email Resmi: {activeConv.companyEmail}</span>
                    )}
                  </div>
                </div>
              </div>

              {activeConv.jobTitle && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold border border-indigo-200 dark:border-indigo-800">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span className="truncate max-w-xs">{activeConv.jobTitle}</span>
                </div>
              )}
            </div>

            {/* Message Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/30 dark:bg-slate-950/20">
              <div className="text-center my-2">
                <span className="text-[10px] px-3 py-1 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-500 font-medium">
                  Saluran Komunikasi Resmi InternSpace (Terenkripsi & Terverifikasi)
                </span>
              </div>

              {activeMessages.map((msg) => {
                const isMyMessage = msg.senderId === currentUser.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2.5 ${
                      isMyMessage ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {!isMyMessage && (
                      <img
                        src={
                          msg.senderAvatar ||
                          'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=120&auto=format&fit=crop&q=80'
                        }
                        alt="Sender"
                        className="w-7 h-7 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0 mb-1"
                      />
                    )}

                    <div
                      className={`max-w-[78%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs shadow-xs leading-relaxed ${
                        isMyMessage
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none'
                      }`}
                    >
                      <div className="text-[10px] font-bold opacity-80 mb-0.5 flex items-center justify-between gap-3">
                        <span>{msg.senderName}</span>
                        <span>
                          {new Date(msg.timestamp).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips for Fast Interaction */}
            {!isCompany && (
              <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
                <span className="text-[10px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Template Tanya Cepat:
                </span>
                <button
                  onClick={() =>
                    handleQuickChip(
                      'Halo, apakah lowongan ini menerima siswa magang PKL SMK/SMA dengan surat rekomendasi resmi sekolah?'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0 transition-colors cursor-pointer"
                >
                  Syarat Surat PKL Sekolah
                </button>
                <button
                  onClick={() =>
                    handleQuickChip(
                      'Selamat siang, bagaimana proses dan tahapan wawancara/tes teknis untuk posisi ini?'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0 transition-colors cursor-pointer"
                >
                  Tahapan Seleksi Wawancara
                </button>
                <button
                  onClick={() =>
                    handleQuickChip(
                      'Bolehkah saya menanyakan mengenai upah/uang saku bulanan dan jam kerja yang berlaku?'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0 transition-colors cursor-pointer"
                >
                  Upah & Jam Kerja
                </button>
              </div>
            )}

            {/* Message Input Box */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
            >
              <textarea
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  isCompany
                    ? `Balas pesan kepada ${activeConv.studentName}... (Tekan Enter untuk kirim)`
                    : `Ketik pertanyaan untuk ${activeConv.companyName}... (Tekan Enter untuk kirim)`
                }
                className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs resize-none focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kirim</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <MessageSquare className="w-12 h-12 mb-3 opacity-30 text-indigo-500" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
              Pilih Percakapan untuk Memulai Chat
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Kirim pesan langsung ke perusahaan mitra pilihan Anda dari katalog lowongan.
            </p>
          </div>
        )}

        {/* RIGHT COLUMN: CONTEXTUAL SIDEBAR (APPLICANT OR COMPANY PROFILE) */}
        {showRightDetails && activeConv && (
          <div className="w-72 border-l border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 p-4 overflow-y-auto hidden lg:block shrink-0 text-xs">
            {isCompany ? (
              /* VIEWING AS COMPANY: SHOW CANDIDATE INFO */
              <div className="space-y-4">
                <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-800">
                  <img
                    src={
                      activeConv.studentAvatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                    }
                    alt="Candidate"
                    className="w-16 h-16 rounded-2xl object-cover mx-auto mb-2 border-2 border-indigo-200"
                  />
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    {activeConv.studentName}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {activeConv.studentRole === 'siswa_sma'
                      ? 'Siswa SMK / SMA (Program PKL)'
                      : 'Mahasiswa Magang'}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Institusi & Kejuruan:
                  </span>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {targetStudentProfile?.namaSekolah ||
                        targetStudentProfile?.universitas ||
                        'Institusi Pendidikan'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {targetStudentProfile?.jurusan} • {targetStudentProfile?.kelas || `Semester ${targetStudentProfile?.semester || 5}`}
                    </div>
                  </div>
                </div>

                {targetStudentProfile?.cvUrl && (
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Dokumen / CV Pelamar:
                    </span>
                    <a
                      href={targetStudentProfile.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold hover:bg-indigo-100 transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 shrink-0" />
                        <span className="truncate">{targetStudentProfile.cvFileName || 'Lihat Dokumen CV'}</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  </div>
                )}

                {targetStudentProfile?.skills && (
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Keahlian Terdata:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {targetStudentProfile.skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* VIEWING AS STUDENT: SHOW COMPANY INFO */
              <div className="space-y-4">
                <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-800">
                  <img
                    src={
                      activeConv.companyLogo ||
                      'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=120&auto=format&fit=crop&q=80'
                    }
                    alt="Company Logo"
                    className="w-16 h-16 rounded-2xl object-cover mx-auto mb-2 border-2 border-indigo-200"
                  />
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1">
                    <span>{activeConv.companyName}</span>
                    <CheckCircle2 className="w-4 h-4 text-sky-500" />
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {targetCompanyProfile?.industri || 'Mitra Industri Resmi'}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Tentang Perusahaan:
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    {targetCompanyProfile?.deskripsi ||
                      'Perusahaan mitra resmi yang terdaftar dan terverifikasi di portal InternSpace.'}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Lokasi Kantor:
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    {targetCompanyProfile?.alamat || 'Jakarta / Jabodetabek'}, {targetCompanyProfile?.kota}
                  </p>
                </div>

                {targetCompanyProfile?.website && (
                  <div>
                    <a
                      href={targetCompanyProfile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Kunjungi Website Resmi</span>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
