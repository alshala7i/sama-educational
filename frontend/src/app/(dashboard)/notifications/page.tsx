'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import { Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { t, dir, lang } = useLanguage();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/notifications')).data,
    refetchInterval: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.post('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  if (isLoading) return <LoadingSpinner />;

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  const groupedByDate = notifications?.reduce((acc: any, notification: any) => {
    const date = new Date(notification.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-KW' : 'en-US');
    if (!acc[date]) acc[date] = [];
    acc[date].push(notification);
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-6" dir={dir}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{t.nav.notifications}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {unreadCount > 0
              ? lang === 'ar' ? `${unreadCount} إشعار غير مقروء` : `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : lang === 'ar' ? 'تم قراءة جميع الإشعارات' : 'All notifications read'
            }
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsReadMutation.mutate()}
            className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl text-sm font-medium"
            style={{ background: 'linear-gradient(135deg, #0f4c75, #1b6ca8)' }}
          >
            <Check size={16} />
            {lang === 'ar' ? 'تعليم الكل كمقروء' : 'Mark All as Read'}
          </button>
        )}
      </div>

      <div className="space-y-6">
        {Object.entries(groupedByDate).map(([date, notifs]: [string, any]) => (
          <div key={date}>
            <h2 className="text-sm font-semibold text-gray-500 mb-3">{date}</h2>
            <div className="space-y-2">
              {notifs.map((notification: any) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-xl border-s-4 transition ${
                    notification.isRead ? 'bg-gray-50 border-gray-300' : 'bg-blue-50 border-blue-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 text-sm">{notification.type}</p>
                        {!notification.isRead && (
                          <Badge variant="info">{t.status.new}</Badge>
                        )}
                      </div>
                      <p className="text-gray-700 text-sm">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsReadMutation.mutate(notification.id)}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex-shrink-0"
                      >
                        {lang === 'ar' ? 'تعليم كمقروء' : 'Mark as read'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {notifications?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">{t.common.noData}</p>
          </div>
        )}
      </div>
    </div>
  );
}
