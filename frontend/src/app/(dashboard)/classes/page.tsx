'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { DataTable } from '@/components/ui/DataTable';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { ClassLevel } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface ClassForm {
  name: string;
  level: ClassLevel;
  capacity: number;
  branchId: string;
}

export default function ClassesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [branchFilter, setBranchFilter] = useState('');
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<ClassForm>();
  const { t, dir } = useLanguage();

  const { data: classes, isLoading } = useQuery({
    queryKey: ['classes', { branchId: branchFilter }],
    queryFn: async () => {
      const params = branchFilter ? `?branchId=${branchFilter}` : '';
      return (await api.get(`/classes${params}`)).data;
    },
  });

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => (await api.get('/branches')).data,
  });

  const createMutation = useMutation({
    mutationFn: (data: ClassForm) => api.post('/classes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setIsModalOpen(false);
      reset();
    },
  });

  if (isLoading) return <LoadingSpinner />;

  const columns = [
    { key: 'name',     label: t.classes.name,     sortable: true },
    { key: 'level',    label: t.classes.level },
    { key: 'capacity', label: t.classes.capacity },
    { key: '_count',   label: t.classes.students,  render: (item: any) => item._count?.students || 0 },
  ];

  return (
    <div className="space-y-6" dir={dir}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{t.classes.title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t.classes.subtitle}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:opacity-90 transition"
          style={{ background: 'linear-gradient(135deg, #0f4c75, #1b6ca8)' }}
        >
          <Plus size={18} />
          {t.classes.addClass}
        </button>
      </div>

      <select
        value={branchFilter}
        onChange={(e) => setBranchFilter(e.target.value)}
        className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white"
      >
        <option value="">{t.common.allBranches}</option>
        {branches?.map((branch: any) => (
          <option key={branch.id} value={branch.id}>{branch.name}</option>
        ))}
      </select>

      <DataTable columns={columns} data={classes || []} />

      <Modal isOpen={isModalOpen} title={t.classes.createClass} onClose={() => setIsModalOpen(false)} size="md">
        <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-4" dir={dir}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.classes.name}</label>
            <input
              {...register('name', { required: true })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.classes.level}</label>
            <select
              {...register('level', { required: true })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white"
            >
              <option value="">{t.classes.selectLevel}</option>
              <option value="NURSERY">{t.classes.nursery}</option>
              <option value="KG1">{t.classes.kg1}</option>
              <option value="KG2">{t.classes.kg2}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.classes.capacity}</label>
            <input
              type="number"
              {...register('capacity', { required: true, valueAsNumber: true })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.classes.branch}</label>
            <select
              {...register('branchId', { required: true })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white"
            >
              <option value="">{t.common.selectBranch}</option>
              {branches?.map((branch: any) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm">
              {t.classes.cancelBtn}
            </button>
            <button type="submit" disabled={isSubmitting}
              className="px-5 py-2.5 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #0f4c75, #1b6ca8)' }}>
              {t.classes.createBtn}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
