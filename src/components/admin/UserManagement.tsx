import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { getUsers, toggleUserStatus } from '../../services/storage';
import { RoleBadge } from '../common/Badge';
import {
  Users,
  Search,
  ShieldAlert,
  ShieldCheck,
  Ban,
  CheckCircle2,
  Mail,
  Calendar,
} from 'lucide-react';

interface UserManagementProps {
  currentUser: User;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ currentUser, onNotify }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'semua' | UserRole>('semua');

  const users = getUsers();

  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === 'semua' || user.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleToggleBlock = (targetUser: User) => {
    if (targetUser.id === currentUser.id) {
      onNotify('Anda tidak dapat memblokir akun Anda sendiri.', 'error');
      return;
    }

    const isCurrentlyBlocked = !!targetUser.isBlocked;
    const action = isCurrentlyBlocked ? 'mengaktifkan kembali' : 'memblokir';
    if (window.confirm(`Apakah Anda yakin ingin ${action} akun "${targetUser.nama}"?`)) {
      toggleUserStatus(targetUser.id);
      onNotify(
        `Status akun ${targetUser.nama} berhasil diperbarui menjadi ${
          isCurrentlyBlocked ? 'AKTIF' : 'DIBLOKIR'
        }.`,
        'success'
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Manajemen Pengguna & Akses
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Pantau seluruh akun terdaftar (Mahasiswa, Mitra Perusahaan, Admin) dan tindak lanjuti akun yang melanggar aturan
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama lengkap atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['semua', 'mahasiswa', 'perusahaan', 'admin'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                roleFilter === r
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Pengguna</th>
                <th className="px-4 py-3">Peran (Role)</th>
                <th className="px-4 py-3">Status Akun</th>
                <th className="px-4 py-3">Terdaftar</th>
                <th className="px-4 py-3 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((u) => {
                const isSelf = u.id === currentUser.id;
                const isBlocked = !!u.isBlocked;

                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            u.avatarUrl ||
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
                          }
                          alt={u.nama}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-100 dark:border-slate-800 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{u.nama}</span>
                            {isSelf && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-normal">
                                Anda
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" /> {u.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <RoleBadge role={u.role} />
                    </td>

                    <td className="px-4 py-3.5">
                      {isBlocked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                          <Ban className="w-3 h-3" />
                          Diblokir
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          Aktif
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      {!isSelf && (
                        <button
                          onClick={() => handleToggleBlock(u)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            isBlocked
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'border border-rose-200 dark:border-rose-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                          }`}
                        >
                          {isBlocked ? 'Pulihkan Akun' : 'Blokir Pengguna'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
