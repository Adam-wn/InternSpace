import React from 'react';
import { InAppNotification, User } from '../types';
import { Bell, Check, CheckCheck, Clock, ArrowRight } from 'lucide-react';
import { markNotificationAsRead, markAllNotificationsAsRead, getNotifications } from '../services/storage';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: InAppNotification[];
  userId?: string;
  currentUser?: User | null;
  onNavigate?: (view: string) => void;
  onMarkAllRead?: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  userId,
  currentUser,
  onNavigate,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  const targetUserId = userId || currentUser?.id || '';
  const notifList = notifications || (targetUserId ? getNotifications(targetUserId) : []);
  const unreadCount = (notifList || []).filter((n) => !n.isRead).length;

  const handleItemClick = (notif: InAppNotification) => {
    if (!notif.isRead) {
      markNotificationAsRead(notif.id);
    }
    if (notif.linkTarget && onNavigate) {
      onNavigate(notif.linkTarget);
      onClose();
    }
  };

  const handleMarkAllRead = () => {
    if (onMarkAllRead) {
      onMarkAllRead();
    } else if (targetUserId) {
      markAllNotificationsAsRead(targetUserId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6">
      <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 mt-14 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Notifikasi</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua notifikasi telah dibaca'}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              id="mark-all-notifications-read"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Tandai Semua Dibaca
            </button>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {notifList.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-30 stroke-1" />
              <p className="text-sm font-medium">Belum ada notifikasi baru</p>
            </div>
          ) : (
            notifList.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className={`p-4 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-start gap-3 ${
                  !notif.isRead ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                    !notif.isRead ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-transparent'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {notif.judul}
                    </h4>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {new Date(notif.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {notif.pesan}
                  </p>
                  {notif.linkTarget && (
                    <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                      <span>Buka halaman</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center bg-slate-50/50 dark:bg-slate-800/40">
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
