import React, { useState, useEffect } from 'react';
import { User, Conversation, ChatMessage } from '../../types';
import { SYSTEM_ADMIN_EMAIL, getChatMessages } from '../../services/storage';
import { getAllConversationsForAdmin } from '../../services/chatService';
import {
  MessageSquare,
  ShieldCheck,
  Search,
  Building2,
  GraduationCap,
  School,
  Clock,
  Filter,
  Eye,
  AlertTriangle,
  Send,
  Sparkles,
  Users,
} from 'lucide-react';

interface AdminChatsViewProps {
  currentUser: User;
  onNotify?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminChatsView: React.FC<AdminChatsViewProps> = ({
  currentUser,
  onNotify,
}) => {
  // Strict admin email check
  if (
    currentUser.email.toLowerCase() !== SYSTEM_ADMIN_EMAIL.toLowerCase() ||
    currentUser.role !== 'admin'
  ) {
    return (
      <div className="p-8 text-center bg-red-50 dark:bg-red-950/30 rounded-3xl border border-red-200 dark:border-red-800">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-red-800 dark:text-red-300">
          Akses Ditolak: Hak Akses Monitoring Chat Khusus Akun Pemilik Sistem
        </h2>
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
          Halaman ini hanya dapat diakses oleh akun resmi {SYSTEM_ADMIN_EMAIL}.
        </p>
      </div>
    );
  }

  const [conversations, setConversations] = useState<Conversation[]>(() =>
    getAllConversationsForAdmin(currentUser)
  );
  const [selectedConvId, setSelectedConvId] = useState<string | null>(() =>
    conversations.length > 0 ? conversations[0].id : null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('Semua');

  useEffect(() => {
    const handleStorageUpdate = () => {
      const updated = getAllConversationsForAdmin(currentUser);
      setConversations(updated);
    };
    window.addEventListener('internspace_data_changed', handleStorageUpdate);
    return () => window.removeEventListener('internspace_data_changed', handleStorageUpdate);
  }, [currentUser]);

  // Extract unique companies for filtering
  const companyOptions = Array.from(new Set(conversations.map((c) => c.companyName)));

  const filteredConversations = conversations.filter((c) => {
    const matchQuery =
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.jobTitle && c.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchCompany =
      selectedCompanyFilter === 'Semua' || c.companyName === selectedCompanyFilter;

    return matchQuery && matchCompany;
  });

  const activeConv = conversations.find((c) => c.id === selectedConvId);
  const activeMessages = selectedConvId ? getChatMessages(selectedConvId) : [];

  // Metrics
  const totalMessagesCount = getChatMessages().length;
  const totalConversationsCount = conversations.length;
  const activeCompaniesCount = new Set(conversations.map((c) => c.companyId)).size;

  return (
    <div className="space-y-6">
      {/* Top Header & Admin Badge */}
      <div className="p-5 rounded-3xl bg-linear-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 text-xs font-bold border border-purple-400/30 mb-2">
              <ShieldCheck className="w-4 h-4 text-purple-300" />
              <span>Akses Khusus Admin ({SYSTEM_ADMIN_EMAIL})</span>
            </div>
            <h1 className="text-xl font-black">
              Pusat Monitoring Seluruh Pesan & Chat Platform
            </h1>
            <p className="text-xs text-purple-200/80 mt-1 max-w-2xl">
              Sebagai Administrator Utama, Anda memiliki kewenangan penuh untuk mengaudit, memantau transparansi komunikasi, dan meninjau interaksi antara seluruh calon anak magang dan 10+ perusahaan mitra.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 text-center min-w-[100px]">
              <div className="text-xs text-purple-200">Total Chat</div>
              <div className="text-lg font-black text-white">{totalConversationsCount} Thread</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 text-center min-w-[100px]">
              <div className="text-xs text-purple-200">Pesan Masuk</div>
              <div className="text-lg font-black text-emerald-300">{totalMessagesCount}</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 text-center min-w-[100px]">
              <div className="text-xs text-purple-200">Mitra Aktif</div>
              <div className="text-lg font-black text-amber-300">{activeCompaniesCount} PT</div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Monitor Workspace */}
      <div className="h-[calc(100vh-14rem)] min-h-[520px] flex flex-col md:flex-row bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {/* LEFT LIST: ALL CONVERSATIONS */}
        <div className="w-full md:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/60 shrink-0">
          {/* Search & Company Filter */}
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari siswa, perusahaan, lowongan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedCompanyFilter}
                onChange={(e) => setSelectedCompanyFilter(e.target.value)}
                className="w-full text-[11px] p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="Semua">Semua Perusahaan ({companyOptions.length})</option>
                {companyOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Conversations Thread List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>Tidak ada percakapan yang cocok dengan filter.</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === selectedConvId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`w-full p-3.5 text-left transition-colors flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-purple-50/80 dark:bg-purple-950/40 border-l-4 border-purple-600'
                        : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={conv.companyLogo}
                        alt="Logo"
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      />
                      <img
                        src={conv.studentAvatar}
                        alt="Student"
                        className="w-5 h-5 rounded-full object-cover border-2 border-white dark:border-slate-900 absolute -bottom-1 -right-1 shadow-xs"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {conv.companyName}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(conv.lastMessageTimestamp).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                        Pelamar: {conv.studentName} ({conv.studentRole === 'siswa_sma' ? 'Siswa' : 'Mhs'})
                      </div>

                      {conv.jobTitle && (
                        <div className="text-[10px] text-purple-600 dark:text-purple-400 truncate">
                          {conv.jobTitle}
                        </div>
                      )}

                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CHAT INSPECTOR / AUDIT STREAM */}
        {activeConv ? (
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
            {/* Header info */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2 overflow-hidden">
                  <img
                    src={activeConv.companyLogo}
                    alt="Company"
                    className="inline-block h-9 w-9 rounded-xl object-cover ring-2 ring-white dark:ring-slate-900"
                  />
                  <img
                    src={activeConv.studentAvatar}
                    alt="Student"
                    className="inline-block h-9 w-9 rounded-xl object-cover ring-2 ring-white dark:ring-slate-900"
                  />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{activeConv.companyName}</span>
                    <span className="text-slate-400 font-normal">↔</span>
                    <span>{activeConv.studentName}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Thread ID: <code className="text-purple-600 font-mono">{activeConv.id}</code> • {activeConv.studentInstitute}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-bold border border-purple-200 dark:border-purple-800">
                  Mode Audit Admin: Read-Only
                </span>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3.5 bg-slate-50/30 dark:bg-slate-950/20">
              {activeMessages.map((msg) => {
                const isCompanyMsg = msg.senderRole === 'perusahaan';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl text-xs border ${
                      isCompanyMsg
                        ? 'bg-sky-50/50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800/50'
                        : 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50'
                    }`}
                  >
                    <img
                      src={msg.senderAvatar}
                      alt="Avatar"
                      className="w-8 h-8 rounded-xl object-cover border border-slate-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {msg.senderName}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                              isCompanyMsg
                                ? 'bg-sky-200 text-sky-800 dark:bg-sky-900 dark:text-sky-200'
                                : 'bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                            }`}
                          >
                            {isCompanyMsg ? 'Akun Perusahaan' : 'Calon Pelamar'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(msg.timestamp).toLocaleString('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>

                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <Eye className="w-10 h-10 mb-2 opacity-30 text-purple-500" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Pilih Thread Percakapan untuk Diaudit
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Semua percakapan antara kandidat magang dan perusahaan mitra tercatat transparan di sini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
