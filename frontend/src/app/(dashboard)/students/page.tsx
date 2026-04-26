'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { DataTable } from '@/components/ui/DataTable';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Search } from 'lucide-react';
import { Student } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface StudentForm {
  name: string;
  age: number;
  branchId: string;
  classId: string;
}

export default function StudentsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [page, setPage] = useState(1);
  const { register, handleSubmit, reset, formState: { isSubmitting }, watch } = useForm<StudentForm>();
  const { t, dir } = useLanguage();

  const selectedBranch = watch('branchId');

  const { data: students, isLoading } = useQuery({
    queryKey: ['students', { branchId: branchFilter, search, skip: (page - 1) * 10 }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (branchFilter) params.append('branchId', branchFilter);
      if (search) params.append('search', search);
      params.append('skip', String((page - 1) * 10));
      params.append('take', '10');
      const res = await api.get(`/students?${params}`);
      return res.data;
    },
  });

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => (await api.get('/branches')).data,
  });

  const { data: classes } = useQuery({
    queryKey: ['classes', { branchId: selectedBranch }],
    queryFn: async () => (await api.get(`/classes?branchId=${selectedBranch}`)).data,
    enabled: !!selectedBranch,
  });

  const createMutation = useMutation({
    mutationFn: (data: StudentForm) => api.post('/students', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsModalOpen(false);
      reset();
    },
  });

  const onSubmit = (data: StudentForm) => {
    createMutation.mutate(data);
  };

  if (isLoading) return <LoadingSpinner />;

  const columns = [
    { key: 'name',   label: t.students.name, sortable: true },
    { key: 'age',    label: t.students.age },
    { key: 'branch', label: t.students.branch, render: (student: Student) => student.branch?.name },
    { key: 'class',  label: t.students.class,  render: (student: Student) => student.class?.name },
    {
      key: 'status',
      label: t.students.status,
      render: (_: any, status: string) => (
        <Badge variant={status === 'ACTIVE' ? 'success' : 'danger'}>
          {status === 'ACTIVE' ? t.status.active : t.status.inactive}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6" dir={dir}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{t.students.title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t.students.subtitle}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:opacity-90 transition"
          style={{ background: 'linear-gradient(135deg, #0f4c75, #1b6ca8)' }}
        >
          <Plus size={18} />
          {t.students.addStudent}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder={t.students.searchPlaceholder}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          />
        </div>

        <select
          value={branchFilter}
          onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white"
        >
          <option value="">{t.common.allBranches}</option>
          {branches?.map((branch: any) => (
            <option key={branch.id} value={branch.id}>{branch.name}</option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={students?.data || []}
        pagination={{
          total: students?.total || 0,
          page,
          pages: students?.pages || 1,
          onPageChange: setPage,
        }}
      />

      <Modal isOpen={isModalOpen} title={t.students.addTitle} onClose={() => setIsModalOpen(false)} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir={dir}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.students.name}</label>
            <input
              {...register('name', { required: true })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.students.age}</label>
            <input
              type="number"
              {...register('age', { required: true, valueAsNumber: true })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.students.branch}</label>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.students.class}</label>
            <select
              {...register('classId', { required: true })}
              disabled={!selectedBranch}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white disabled:opacity-50"
            >
              <option value="">{t.common.selectClass}</option>
              {classes?.map((cls: any) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm"
            >
              {t.students.cancelBtn}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #0f4c75, #1b6ca8)' }}
            >
              {t.students.addBtn}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
