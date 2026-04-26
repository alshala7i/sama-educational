'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function ReportsPage() {
  const { t, dir } = useLanguage();
  return (
    <div className="space-y-6" dir={dir}>
      <div>
        <h1 className="text-2xl font-black text-gray-900">{t.reports.title}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{t.reports.subtitle}</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <p className="text-gray-400">{t.common.noData}</p>
      </div>
    </div>
  );
}
