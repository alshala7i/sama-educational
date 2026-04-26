import clsx from 'clsx';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: { direction: 'up' | 'down'; percentage: number };
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal';
  className?: string;
}

const colorMap = {
  blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-100 text-blue-600',   border: 'border-blue-400',  value: 'text-blue-700' },
  green:  { bg: 'bg-green-50',  icon: 'bg-green-100 text-green-600',  border: 'border-green-400', value: 'text-green-700' },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', border: 'border-purple-400', value: 'text-purple-700' },
  orange: { bg: 'bg-orange-50', icon: 'bg-orange-100 text-orange-600', border: 'border-orange-400', value: 'text-orange-700' },
  red:    { bg: 'bg-red-50',    icon: 'bg-red-100 text-red-600',     border: 'border-red-400',   value: 'text-red-700' },
  teal:   { bg: 'bg-teal-50',   icon: 'bg-teal-100 text-teal-600',   border: 'border-teal-400',  value: 'text-teal-700' },
};

export function StatCard({ icon: Icon, label, value, trend, color = 'blue', className }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={clsx(
      'rounded-2xl p-5 border-r-4 shadow-sm hover:shadow-md transition-all duration-200',
      c.bg, c.border, className
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className={clsx('p-2.5 rounded-xl', c.icon)}>
          <Icon size={22} />
        </div>
        {trend && (
          <span className={clsx('text-xs font-semibold px-2 py-1 rounded-full', {
            'bg-green-100 text-green-700': trend.direction === 'up',
            'bg-red-100 text-red-700': trend.direction === 'down',
          })}>
            {trend.direction === 'up' ? '↑' : '↓'} {trend.percentage}%
          </span>
        )}
      </div>
      <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
      <p className={clsx('text-2xl font-black', c.value)}>{value}</p>
    </div>
  );
}
