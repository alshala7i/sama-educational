'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function FinancePage() {
  const { t, dir } = useLanguage();

  const { data: summary, isLoading } = useQuery({
    queryKey: ['finance-summary'],
    queryFn: async () => (await api.get('/finance/summary')).data,
  });

  const { data: branches } = useQuery({
    queryKey: ['finance-branches'],
    queryFn: async () => (await api.get('/finance/branches/comparison')).data,
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-8" dir={dir}>
      <div>
        <h1 className="text-2xl font-black text-gray-900">{t.finance.title}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{t.finance.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/finance/fees">
          <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition cursor-pointer border-l-4 border-green-500">
            <p className="text-gray-500 text-sm font-medium">{t.finance.totalRevenue}</p>
            <p className="text-3xl font-black text-gray-900 mt-2">
              {t.common.currency} {(summary?.revenue || 0).toLocaleString()}
            </p>
          </div>
        </Link>

        <Link href="/finance/expenses">
          <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition cursor-pointer border-l-4 border-red-500">
            <p className="text-gray-500 text-sm font-medium">{t.finance.totalExpenses}</p>
            <p className="text-3xl font-black text-gray-900 mt-2">
              {t.common.currency} {(summary?.expenses || 0).toLocaleString()}
            </p>
          </div>
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm font-medium">{t.finance.netProfit}</p>
          <p className="text-3xl font-black text-blue-600 mt-2">
            {t.common.currency} {(summary?.profit || 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-bold text-gray-800 mb-4">{t.finance.branchComparison}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-start font-medium text-gray-600">{t.finance.branch}</th>
                <th className="px-6 py-3 text-end font-medium text-gray-600">{t.finance.revenue}</th>
                <th className="px-6 py-3 text-end font-medium text-gray-600">{t.finance.expenses}</th>
                <th className="px-6 py-3 text-end font-medium text-gray-600">{t.finance.profit}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {branches?.map((branch: any) => (
                <tr key={branch.branchId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900 font-medium">{branch.branch}</td>
                  <td className="px-6 py-4 text-end text-green-600 font-medium">
                    {t.common.currency} {branch.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-end text-red-600 font-medium">
                    {t.common.currency} {branch.expenses.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-end font-medium">
                    {branch.profit >= 0 ? '+' : ''}{t.common.currency} {branch.profit.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/finance/fees">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 hover:shadow-md transition cursor-pointer border border-green-200">
            <h3 className="text-base font-bold text-green-900 mb-2">{t.finance.feesTitle}</h3>
            <p className="text-green-700 text-sm">{t.finance.feesSubtitle}</p>
          </div>
        </Link>

        <Link href="/finance/expenses">
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-8 hover:shadow-md transition cursor-pointer border border-red-200">
            <h3 className="text-base font-bold text-red-900 mb-2">{t.finance.expensesTitle}</h3>
            <p className="text-red-700 text-sm">{t.finance.expensesSubtitle}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
