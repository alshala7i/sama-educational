'use client';

import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Bell, LogOut, ChevronDown } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import api from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

const pathToNavKey: Record<string, string> = {
  '/dashboard':      'dashboard',
  '/branches':       'branches',
  '/classes':        'classes',
  '/students':       'students',
  '/attendance':     'attendance',
  '/daily-logs':     'dailyLogs',
  '/maintenance':    'maintenance',
  '/finance':        'finance',
  '/reports':        'reports',
  '/settings/users': 'users',
};

export function Header() {
  const { user, logout } = useAuth();
  const { t, dir, isRTL } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { data: notificationData } = useQuery({
    queryKey: ['unread-notifications'],
    queryFn: async () => (await api.get('/notifications/unread-count')).data,
    refetchInterval: 30000,
  });

  const handleLogout = () => { logout(); router.push('/login'); };

  const pageKey = Object.keys(pathToNavKey).find(k => pathname === k || pathname.startsWith(k + '/'));
  const navKey = pageKey ? pathToNavKey[pageKey] : null;
  const pageTitle = navKey ? t.nav[navKey as keyof typeof t.nav] : '';

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm" dir={dir}>
      <div className="px-6 py-3.5 flex items-center justify-between">
        {/* Page title */}
        <div>
          <h2 className="text-lg font-bold text-gray-800">{pageTitle}</h2>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button
            onClick={() => router.push('/notifications')}
            className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
          >
            <Bell size={20} />
            {notificationData?.unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {notificationData.unreadCount}
              </span>
            )}
          </button>

          <div className="w-px h-6 bg-gray-200" />

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 hover:bg-gray-50 px-3 py-2 rounded-xl transition"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className={`hidden sm:block ${isRTL ? 'text-right' : 'text-left'}`}>
                <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.name}</p>
                <p className="text-xs text-gray-400">
                  {t.roles[user?.role as keyof typeof t.roles] || user?.role}
                </p>
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden`}>
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-teal-50 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold">
                        {user?.name?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{user?.name}</p>
                        <p className="text-xs text-gray-500">
                          {t.roles[user?.role as keyof typeof t.roles] || user?.role}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition"
                    >
                      <LogOut size={16} />
                      {t.nav.logout}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
