'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useState } from 'react';
import { format } from 'date-fns';
import { Check, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface AttendanceRecord {
  studentId: string;
  status: 'PRESENT' | 'ABSENT';
  date: string;
}

export default function AttendancePage() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedClassId, setSelectedClassId] = useState('');
  const [attendance, setAttendance] = useState<Record<string, 'PRESENT' | 'ABSENT'>>({});
  const { t, dir } = useLanguage();

  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ['classes-for-attendance'],
    queryFn: async () => (await api.get('/classes')).data,
  });

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['attendance', { classId: selectedClassId, date: selectedDate }],
    queryFn: async () => {
      if (!selectedClassId) return [];
      return (await api.get(`/attendance?classId=${selectedClassId}&date=${selectedDate}`)).data;
    },
    enabled: !!selectedClassId,
  });

  const bulkMutation = useMutation({
    mutationFn: (records: AttendanceRecord[]) => api.post('/attendance/bulk', { records }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      setAttendance({});
      alert(t.attendance.saveSuccess);
    },
  });

  const handleMarkAll = (status: 'PRESENT' | 'ABSENT') => {
    const newAttendance: Record<string, 'PRESENT' | 'ABSENT'> = {};
    students?.forEach((student: any) => { newAttendance[student.id] = status; });
    setAttendance(newAttendance);
  };

  const handleSaveAttendance = () => {
    const records = Object.entries(attendance).map(([studentId, status]) => ({
      studentId, status, date: selectedDate,
    }));
    if (records.length === 0) { alert(t.attendance.saveError); return; }
    bulkMutation.mutate(records);
  };

  if (classesLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6" dir={dir}>
      <div>
        <h1 className="text-2xl font-black text-gray-900">{t.attendance.title}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{t.attendance.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.attendance.selectDate}</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => { setSelectedDate(e.target.value); setAttendance({}); }}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            dir="ltr"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.attendance.selectClass}</label>
          <select
            value={selectedClassId}
            onChange={(e) => { setSelectedClassId(e.target.value); setAttendance({}); }}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white"
          >
            <option value="">{t.attendance.chooseClass}</option>
            {classes?.map((cls: any) => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedClassId && !studentsLoading && (
        <>
          <div className="flex gap-2">
            <button
              onClick={() => handleMarkAll('PRESENT')}
              className="px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center gap-2 text-sm font-medium"
            >
              <Check size={16} />
              {t.attendance.markAllPresent}
            </button>
            <button
              onClick={() => handleMarkAll('ABSENT')}
              className="px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition flex items-center gap-2 text-sm font-medium"
            >
              <X size={16} />
              {t.attendance.markAllAbsent}
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase text-start">
                      {t.attendance.student}
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase text-start">
                      {t.attendance.status}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students?.map((student: any) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{student.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setAttendance({ ...attendance, [student.id]: 'PRESENT' })}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                              attendance[student.id] === 'PRESENT'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {t.attendance.present}
                          </button>
                          <button
                            onClick={() => setAttendance({ ...attendance, [student.id]: 'ABSENT' })}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                              attendance[student.id] === 'ABSENT'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {t.attendance.absent}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveAttendance}
              disabled={bulkMutation.isPending}
              className="px-6 py-2.5 text-white rounded-xl font-semibold disabled:opacity-50 transition"
              style={{ background: 'linear-gradient(135deg, #0f4c75, #1b6ca8)' }}
            >
              {bulkMutation.isPending ? t.attendance.saving : t.attendance.saveBtn}
            </button>
          </div>
        </>
      )}

      {!selectedClassId && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400">{t.attendance.noClass}</p>
        </div>
      )}
    </div>
  );
}
