'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { StatCard } from '@/components/ui/StatCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Building2, TrendingUp, Wallet, AlertCircle, FileText, BookOpen, CalendarCheck, ArrowUpRight, MapPin, UserCheck, UserX } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t, lang, dir, isRTL } = useLanguage();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => (await api.get('/dashboard/super-admin')).data,
  });

  const { data: trendData } = useQuery({
    queryKey: ['dashboard-trend'],
    queryFn: async () => (await api.get('/dashboard/trend')).data,
  });

  const { data: branchesAttendance } = useQuery({
    queryKey: ['branches-attendance'],
    queryFn: async () => (await api.get('/dashboard/branches-attendance')).data,
  });

  if (isLoading) return <LoadingSpinner />;

  const revenueKey = isRTL ? 'الإيرادات' : 'Revenue';
  const expensesKey = isRTL ? 'المصروفات' : 'Expenses';

  const chartData = trendData?.months?.map((month: string, idx: number) => ({
    name: month,
    [revenueKey]: trendData.revenue[idx] || 0,
    [expensesKey]: trendData.expenses[idx] || 0,
  })) || [];

  const today = new Date().toLocaleDateString(isRTL ? 'ar-KW' : 'en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const quickActions = [
    { label: t.dashboard.addStudent,        href: '/students',    icon: '👶', color: 'bg-blue-500' },
    { label: t.dashboard.markAttendance,    href: '/attendance',  icon: '✅', color: 'bg-green-500' },
    { label: t.dashboard.requestMaintenance,href: '/maintenance', icon: '🔧', color: 'bg-orange-500' },
    { label: t.dashboard.addExpense,        href: '/finance',     icon: '💰', color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6" dir={dir}>

      {/* Welcome banner */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f4c75 0%, #1b6ca8 60%, #16a085 100%)' }}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white opacity-5" />
        <div className="absolute -bottom-10 right-32 w-32 h-32 rounded-full bg-white opacity-5" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="text-blue-200 text-sm mb-1">{today}</p>
            <h1 className="text-2xl font-black mb-1">
              {t.dashboard.welcome.replace('{name}', user?.name?.split(' ')[0] || (isRTL ? 'المدير' : 'Admin'))}
            </h1>
            <p className="text-blue-100 text-sm">
              {t.dashboard.maintenanceAlert.replace('{count}', String(stats?.openMaintenance || 0))}
              {stats?.missingLogs > 0 && t.dashboard.missingLogs.replace('{count}', String(stats.missingLogs))}
            </p>
          </div>
          <div className="bg-white bg-opacity-15 rounded-xl px-4 py-3 text-center">
            <p className="text-3xl font-black">{stats?.totalBranches || 0}</p>
            <p className="text-blue-200 text-xs">{t.dashboard.activeBranch}</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 mb-3">{t.dashboard.quickActions}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map(a => (
            <Link key={a.href} href={a.href}
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100 flex items-center gap-3 group">
              <span className={`${a.color} text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0`}>
                {a.icon}
              </span>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Main stats */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 mb-3">{t.dashboard.stats}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon={Users}     label={t.dashboard.totalStudents}  value={stats?.totalStudents || 0}    color="blue" />
          <StatCard icon={Building2} label={t.dashboard.totalBranches}  value={stats?.totalBranches || 0}    color="teal" />
          <StatCard icon={BookOpen}  label={t.dashboard.occupancyRate}  value={`${stats?.occupancyRate || 0}%`} color="purple" />
          <StatCard icon={Wallet}    label={t.dashboard.totalRevenue}   value={`${t.common.currency} ${(stats?.totalRevenue || 0).toLocaleString()}`}  color="green" />
          <StatCard icon={TrendingUp} label={t.dashboard.totalExpenses} value={`${t.common.currency} ${(stats?.totalExpenses || 0).toLocaleString()}`} color="orange" />
          <StatCard icon={TrendingUp} label={t.dashboard.netProfit}     value={`${t.common.currency} ${(stats?.netProfit || 0).toLocaleString()}`}     color={(stats?.netProfit || 0) >= 0 ? 'green' : 'red'} />
        </div>
      </div>

      {/* Alerts row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-yellow-100 p-5 flex items-center gap-4">
          <div className="bg-yellow-100 p-3 rounded-xl">
            <AlertCircle size={24} className="text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900">{stats?.openMaintenance || 0}</p>
            <p className="text-sm text-gray-500">{t.dashboard.openMaintenance}</p>
          </div>
          <Link href="/maintenance" className={`${isRTL ? 'mr-auto' : 'ml-auto'} text-yellow-600 hover:text-yellow-700`}>
            <ArrowUpRight size={20} />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-5 flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-xl">
            <FileText size={24} className="text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900">{stats?.missingLogs || 0}</p>
            <p className="text-sm text-gray-500">{t.dashboard.missingDailyLogs}</p>
          </div>
          <Link href="/daily-logs" className={`${isRTL ? 'mr-auto' : 'ml-auto'} text-red-500 hover:text-red-600`}>
            <ArrowUpRight size={20} />
          </Link>
        </div>
      </div>

      {/* Branch Attendance Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-800">{t.dashboard.branchAttendance}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date().toLocaleDateString(isRTL ? 'ar-KW' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <Link href="/attendance"
            className="flex items-center gap-1.5 text-xs text-white px-3 py-1.5 rounded-lg font-medium"
            style={{ background: 'linear-gradient(135deg, #0f4c75, #1b6ca8)' }}>
            <CalendarCheck size={13} />
            {t.dashboard.recordAttendance}
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {(branchesAttendance || []).map((branch: any) => {
            const total = branch.totalStudents || 0;
            const present = branch.presentToday || 0;
            const absent = branch.absentToday || 0;
            const notRecorded = Math.max(total - present - absent, 0);
            const rate = total > 0 ? Math.round((present / total) * 100) : 0;

            const theme = rate >= 80
              ? { bg: 'from-emerald-500 to-teal-600' }
              : rate >= 50
              ? { bg: 'from-amber-400 to-orange-500' }
              : { bg: 'from-rose-400 to-red-500' };

            const presentPct = total > 0 ? (present / total) * 100 : 0;
            const absentPct  = total > 0 ? (absent  / total) * 100 : 0;

            return (
              <div key={branch.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">

                <div className={`bg-gradient-to-l ${theme.bg} px-5 py-4 flex items-center justify-between`}>
                  <div className="min-w-0">
                    <h3 className="text-white font-bold text-sm leading-tight truncate">{branch.name}</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin size={10} className="text-white opacity-70 flex-shrink-0" />
                      <span className="text-white text-xs opacity-70 truncate">{branch.location}</span>
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-xl px-3 py-1.5 text-center flex-shrink-0 mx-3">
                    <p className="text-white text-2xl font-black leading-none">{rate}%</p>
                    <p className="text-white text-xs opacity-80 mt-0.5">{t.dashboard.attendanceRate}</p>
                  </div>
                </div>

                <div className="px-5 pt-4">
                  <div className="flex w-full h-3 rounded-full overflow-hidden bg-gray-100 gap-px">
                    {presentPct > 0 && (
                      <div className="bg-emerald-500 h-full transition-all" style={{ width: `${presentPct}%` }} />
                    )}
                    {absentPct > 0 && (
                      <div className="bg-rose-400 h-full transition-all" style={{ width: `${absentPct}%` }} />
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-xs text-gray-400">
                    <span>0</span>
                    <span className="font-medium text-gray-600">{total} {t.dashboard.student}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 divide-x divide-x-reverse divide-gray-100 px-2 pb-4 mt-2">
                  <div className="text-center px-2 py-2">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                      <span className="text-2xl font-black text-gray-900 leading-none">{present}</span>
                    </div>
                    <span className="text-xs text-gray-500 flex items-center justify-center gap-1">
                      <UserCheck size={11} className="text-emerald-500" />
                      {t.dashboard.presentToday}
                    </span>
                  </div>

                  <div className="text-center px-2 py-2">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0" />
                      <span className="text-2xl font-black text-gray-900 leading-none">{absent}</span>
                    </div>
                    <span className="text-xs text-gray-500 flex items-center justify-center gap-1">
                      <UserX size={11} className="text-rose-400" />
                      {t.dashboard.absentToday}
                    </span>
                  </div>

                  <div className="text-center px-2 py-2">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
                      <span className="text-2xl font-black text-gray-400 leading-none">{notRecorded}</span>
                    </div>
                    <span className="text-xs text-gray-400 flex items-center justify-center gap-1">
                      <Users size={11} className="text-gray-400" />
                      {t.dashboard.notRecorded}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-gray-800">{t.dashboard.revenueChart}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{t.dashboard.chartSubtitle}</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-teal-500 inline-block"/>{t.dashboard.revenue}</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400 inline-block"/>{t.dashboard.expenses}</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} barGap={4} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              formatter={(value: number) => [`${t.common.currency} ${value.toLocaleString()}`, '']}
            />
            <Bar dataKey={revenueKey} fill="#14b8a6" radius={[6, 6, 0, 0]} />
            <Bar dataKey={expensesKey} fill="#f87171" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
