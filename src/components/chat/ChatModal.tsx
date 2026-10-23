import React, { useState, useEffect, useRef } from 'react';
import { User, JobListing, Conversation, ChatMessage } from '../../types';
import { Modal } from '../common/Modal';
import { getOrCreateConversation, sendMessage } from '../../services/chatService';
import { getChatMessages } from '../../services/storage';
import {
  Send,
  MessageSquare,
  Sparkles,
  Building2,
  CheckCircle2,
  ExternalLink,
  Briefcase,
} from 'lucide-react';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  targetCompanyId: string;
  targetCompanyName: string;
  targetCompanyLogo?: string;
  job?: JobListing | null;
  onNavigateToFullChat?: (conversationId: string) => void;
  onNotify?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  targetCompanyId,
  targetCompanyName,
  targetCompanyLogo,
  job,
  onNavigateToFullChat,
  onNotify,
}) => {
  const [inputText, setInputText] = useState('');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && currentUser && targetCompanyId) {
      const conv = getOrCreateConversation({
        companyId: targetCompanyId,
        studentUser: currentUser,
        jobId: job?.id,
        jobTitle: job?.judul,
      });
      setConversation(conv);
      setMessages(getChatMessages(conv.id));
    }
  }, [isOpen, currentUser, targetCompanyId, job]);

  useEffect(() => {
    const handleStorage = () => {
      if (conversation) {
        setMessages(getChatMessages(conversation.id));
      }
    };
    window.addEventListener('internspace_data_changed', handleStorage);
    return () => window.removeEventListener('internspace_data_changed', handleStorage);
  }, [conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (!isOpen) return null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !conversation || !currentUser) return;

    try {
      setIsSending(true);
      sendMessage({
        conversationId: conversation.id,
        sender: currentUser,
        text: inputText,
        autoReply: true,
      });
      setInputText('');
      setMessages(getChatMessages(conversation.id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengirim pesan';
      if (onNotify) onNotify(msg, 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleChipClick = (text: string) => {
    setInputText(text);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Kirim Pesan ke ${targetCompanyName}`}
      subtitle={job ? `Terkait lowongan: ${job.judul}` : 'Pertanyaan langsung ke akun resmi mitra'}
      maxWidth="lg"
    >
      <div className="flex flex-col h-[480px]">
        {/* Header Company Badge */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <img
              src={
                targetCompanyLogo ||
                'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=120&auto=format&fit=crop&q=80'
              }
              alt="Logo"
              className="w-9 h-9 rounded-xl object-cover border border-slate-200"
            />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{targetCompanyName}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />
              </div>
              <div className="text-[10px] text-slate-500">
                Akun Resmi Mitra Terverifikasi • Respon Cepat
              </div>
            </div>
          </div>

          {onNavigateToFullChat && conversation && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToFullChat(conversation.id);
              }}
              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Buka di Chat Penuh</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-slate-50/40 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <MessageSquare className="w-10 h-10 text-indigo-400 mb-2 opacity-60" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Belum ada percakapan dengan {targetCompanyName}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                Tanyakan kriteria seleksi, persiapan dokumen PKL, atau pertanyaan seputar tugas harian magang.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = currentUser && msg.senderId === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-xs ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none'
                    }`}
                  >
                    <div className="text-[10px] opacity-75 font-bold mb-0.5 flex items-center justify-between gap-3">
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
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="py-2 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
          <span className="text-[10px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Tanya Cepat:
          </span>
          <button
            type="button"
            onClick={() =>
              handleChipClick(
                'Halo, apakah saya boleh tahu kriteria portofolio yang paling diutamakan untuk posisi ini?'
              )
            }
            className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0 cursor-pointer"
          >
            Kriteria Portofolio
          </button>
          <button
            type="button"
            onClick={() =>
              handleChipClick(
                'Halo, apakah posisi ini terbuka untuk siswa PKL SMK dengan surat tugas resmi sekolah?'
              )
            }
            className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0 cursor-pointer"
          >
            Penerimaan PKL Siswa
          </button>
          <button
            type="button"
            onClick={() =>
              handleChipClick(
                'Berapa lama estimasi proses seleksi dan pengumuman setelah berkas lamaran dikirim?'
              )
            }
            className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0 cursor-pointer"
          >
            Estimasi Waktu Seleksi
          </button>
        </div>

        {/* Input and Send Button */}
        <form onSubmit={handleSend} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            required
            placeholder={`Tulis pesan untuk ${targetCompanyName}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim</span>
          </button>
        </form>
      </div>
    </Modal>
  );
};
