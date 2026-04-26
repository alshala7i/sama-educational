'use client';

import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  BarChart3, BookOpen, Building2, CalendarDays,
  DollarSign, FileText, LogOut, Menu, Users, Wrench, X,
  Languages,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import clsx from 'clsx';

interface NavItem {
  href: string;
  key: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  { href: '/dashboard',      key: 'dashboard',  icon: <BarChart3 size={18} /> },
  { href: '/branches',       key: 'branches',   icon: <Building2 size={18} />, roles: ['SUPER_ADMIN', 'BRANCH_MANAGER'] },
  { href: '/classes',        key: 'classes',    icon: <BookOpen size={18} /> },
  { href: '/students',       key: 'students',   icon: <Users size={18} /> },
  { href: '/attendance',     key: 'attendance', icon: <CalendarDays size={18} /> },
  { href: '/daily-logs',     key: 'dailyLogs',  icon: <FileText size={18} /> },
  { href: '/maintenance',    key: 'maintenance',icon: <Wrench size={18} /> },
  { href: '/finance',        key: 'finance',    icon: <DollarSign size={18} /> },
  { href: '/reports',        key: 'reports',    icon: <BarChart3 size={18} /> },
  { href: '/settings/users', key: 'users',      icon: <Users size={18} />, roles: ['SUPER_ADMIN'] },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const { t, lang, toggleLang, dir, isRTL } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = navItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role || '');
  });

  const handleLogout = () => { logout(); router.push('/login'); };

  const SidebarContent = () => (
    <nav className="flex flex-col h-full" dir={dir}>
      {/* Header */}
      <div className="p-5 border-b border-white border-opacity-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
              <span className="text-blue-700 font-black text-xs">{isRTL ? 'سما' : 'NOP'}</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">{t.brand.name}</p>
              <p className="text-blue-300 text-xs">{isRTL ? 'Sama Educational' : 'سما التعليمية'}</p>
            </div>
          </div>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden text-gray-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* User card */}
      <div className="mx-3 mt-4 mb-2 bg-white bg-opacity-10 rounded-xl p-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.name || t.common.name}</p>
            <p className="text-blue-300 text-xs">{t.roles[user?.role as keyof typeof t.roles] || user?.role}</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {visibleItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group',
                isActive
                  ? 'bg-white bg-opacity-15 text-white'
                  : 'text-blue-200 hover:bg-white hover:bg-opacity-10 hover:text-white'
              )}
            >
              <span className={clsx(
                'flex-shrink-0 p-1.5 rounded-lg',
                isActive ? 'bg-white bg-opacity-20 text-white' : 'text-blue-300 group-hover:text-white'
              )}>
                {item.icon}
              </span>
              <span className="text-sm font-medium">
                {t.nav[item.key as keyof typeof t.nav]}
              </span>
              {isActive && <span className={clsx('w-1.5 h-1.5 rounded-full bg-teal-400', isRTL ? 'mr-auto' : 'ml-auto')} />}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white border-opacity-10 space-y-1">
        {/* Language toggle */}
        <button
          onClick={toggleLang}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-blue-300 hover:bg-white hover:bg-opacity-10 hover:text-white rounded-xl transition"
          title={lang === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
        >
          <span className="p-1.5"><Languages size={18} /></span>
          <span className="text-sm">{lang === 'en' ? 'العربية' : 'English'}</span>
          <span className="mr-auto ml-auto" />
          <span className="text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded-full font-medium">
            {lang.toUpperCase()}
          </span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-blue-300 hover:bg-white hover:bg-opacity-10 hover:text-white rounded-xl transition"
        >
          <span className="p-1.5"><LogOut size={18} /></span>
          <span className="text-sm">{t.nav.logout}</span>
        </button>
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-6 left-6 lg:hidden z-40 text-white p-3 rounded-full shadow-xl"
        style={{ background: 'linear-gradient(135deg, #1b6ca8, #16a085)' }}
      >
        <Menu size={22} />
      </button>

      {/* Backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 lg:hidden z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-64 h-screen sticky top-0"
        style={{ background: 'linear-gradient(180deg, #0f4c75 0%, #1b6ca8 50%, #134e6f 100%)' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <aside
        className={clsx(
          'fixed lg:hidden left-0 top-0 h-screen w-64 z-50 transition-transform duration-300 flex flex-col',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ background: 'linear-gradient(180deg, #0f4c75 0%, #1b6ca8 50%, #134e6f 100%)' }}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
