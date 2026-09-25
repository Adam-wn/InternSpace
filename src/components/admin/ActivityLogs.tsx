import React, { useState } from 'react';
import { User, ActivityLog } from '../../types';
import { getActivityLogs } from '../../services/storage';
import {
  Activity,
  UserCheck,
  Briefcase,
  FileText,
  Building2,
  Clock,
  Search,
} from 'lucide-react';

interface ActivityLogsProps {
  currentUser: User;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const ActivityLogs: React.FC<ActivityLogsProps> = ({ currentUser, onNotify }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const logs = getActivityLogs();

  const filteredLogs = logs.filter((log) => {
    return (
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getActionIcon = (action: string) => {
    if (action.includes('Verifikasi')) return <Building2 className="w-4 h-4 text-emerald-500" />;
    if (action.includes('Lamaran')) return <FileText className="w-4 h-4 text-indigo-500" />;
    if (action.includes('Lowongan')) return <Briefcase className="w-4 h-4 text-amber-500" />;
    return <Activity className="w-4 h-4 text-sky-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Log Audit Aktivitas Sistem
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Rekam jejak seluruh peristiwa penting, transaksi lamaran, dan keputusan verifikasi di platform InternSpace
          </p>
        </div>

        <div className="text-xs text-slate-500">
          Total Rekaman: <strong>{logs.length}</strong> peristiwa
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Cari aktivitas berdasarkan aksi, nama pengguna, atau rincian kegiatan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
        />
      </div>

      {/* Logs Timeline List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Tidak ada catatan log aktivitas yang cocok.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors flex items-start gap-3.5 text-xs"
            >
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                {getActionIcon(log.action)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{log.action}</span>
                    <span className="text-[10px] font-normal px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      Oleh: {log.userName}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(log.timestamp).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{log.details}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
