'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, MapPin, Users, Building2, BookOpen, TrendingUp } from 'lucide-react';
import { BranchStatus } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface BranchForm {
  name: string;
  location: string;
  capacity: number;
  numClasses: number;
  status: BranchStatus;
}

export default function BranchesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<BranchForm>();
  const { t, dir } = useLanguage();

  const { data: branches, isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const res = await api.get('/branches');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: BranchForm) => api.post('/branches', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      setIsModalOpen(false);
      reset();
    },
  });

  const onSubmit = (data: BranchForm) => {
    createMutation.mutate({ ...data, capacity: Number(data.capacity), numClasses: Number(data.numClasses) });
  };

  if (isLoading) return <LoadingSpinner />;

  const totalStudents = (branches || []).reduce((s: number, b: any) => s + (b.studentCount || 0), 0);
  const totalCapacity = (branches || []).reduce((s: number, b: any) => s + (b.capacity || 0), 0);
  const activeBranches = (branches || []).filter((b: any) => b.status === 'ACTIVE').length;
  const overallOccupancy = totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0;

  return (
    <div className="space-y-6" dir={dir}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{t.branches.title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {t.branches.subtitle.replace('{count}', String((branches || []).length))}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:opacity-90 transition"
          style={{ background: 'linear-gradient(135deg, #0f4c75, #1b6ca8)' }}
        >
          <Plus size={18} />
          {t.branches.addBranch}
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Building2, label: t.branches.activeBranches, value: activeBranches, color: 'text-blue-600', bg: 'bg-blue-50' },
          { icon: Users,     label: t.branches.totalStudents,  value: totalStudents,  color: 'text-green-600', bg: 'bg-green-50' },
          { icon: BookOpen,  label: t.branches.totalCapacity,  value: totalCapacity,  color: 'text-purple-600', bg: 'bg-purple-50' },
          { icon: TrendingUp,label: t.branches.occupancyRate,  value: `${overallOccupancy}%`, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`${bg} p-2.5 rounded-xl`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className={`text-xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Branch cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {(branches || []).map((branch: any) => {
          const enrolled = branch.studentCount || 0;
          const cap = branch.capacity || 1;
          const pct = Math.min(Math.round((enrolled / cap) * 100), 100);
          const isActive = branch.status === 'ACTIVE';
          const barColor = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#10b981';

          return (
            <div key={branch.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">

              <div className="h-1.5 w-full" style={{ background: isActive ? 'linear-gradient(90deg, #0f4c75, #16a085)' : '#d1d5db' }} />

              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-black text-gray-900 text-base leading-tight">{branch.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-400">{branch.location || '—'}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {isActive ? t.branches.active : t.branches.inactive}
                  </span>
                </div>

                {/* Occupancy bar */}
                <div className="mt-4 mb-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-500">{t.branches.capacity}</span>
                    <span className="text-xs font-bold" style={{ color: barColor }}>{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: barColor }}
                    />
                  </div>
                </div>

                {/* Student count vs capacity */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                      <Users size={14} className="text-blue-600" />
                      <span className="text-xl font-black text-blue-700">{enrolled}</span>
                    </div>
                    <p className="text-xs text-gray-500">{t.branches.studentsEnrolled}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                      <BookOpen size={14} className="text-gray-500" />
                      <span className="text-xl font-black text-gray-700">{cap}</span>
                    </div>
                    <p className="text-xs text-gray-500">{t.branches.fullCapacity}</p>
                  </div>
                </div>

                {/* Available seats */}
                <p className="mt-3 text-center text-xs text-gray-400">
                  {cap - enrolled > 0
                    ? <span className="text-green-600 font-semibold">
                        {t.branches.seatsAvailable.replace('{count}', String(cap - enrolled))}
                      </span>
                    : <span className="text-red-500 font-semibold">{t.branches.branchFull}</span>
                  }
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Branch Modal */}
      <Modal
        isOpen={isModalOpen}
        title={t.branches.addTitle}
        onClose={() => setIsModalOpen(false)}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir={dir}>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t.branches.branchName}</label>
            <input
              {...register('name', { required: true })}
              placeholder={t.branches.branchNamePlaceholder}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t.common.location}</label>
            <input
              {...register('location', { required: true })}
              placeholder={t.branches.locationPlaceholder}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{t.branches.capacityLabel}</label>
              <input
                type="number"
                {...register('capacity', { required: true, valueAsNumber: true })}
                placeholder="50"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{t.branches.numClasses}</label>
              <input
                type="number"
                {...register('numClasses', { required: true, valueAsNumber: true })}
                placeholder="5"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t.branches.statusLabel}</label>
            <select
              {...register('status', { required: true })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white"
            >
              <option value="ACTIVE">{t.status.active}</option>
              <option value="INACTIVE">{t.status.inactive}</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm font-medium"
            >
              {t.branches.cancelBtn}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-white rounded-xl hover:opacity-90 transition text-sm font-semibold disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #0f4c75, #1b6ca8)' }}
            >
              {isSubmitting ? t.branches.saving : t.branches.addBtn}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
