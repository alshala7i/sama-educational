'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, ClipboardList, Phone, Footprints, Pencil, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';

const FOLLOW_UP_STATUSES = [
  'PENDING',
  'CONTACTED',
  'INTERESTED',
  'REGISTERED',
  'NOT_INTERESTED',
  'NO_RESPONSE',
] as const;

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-600',
  CONTACTED: 'bg-blue-100 text-blue-700',
  INTERESTED: 'bg-amber-100 text-amber-700',
  REGISTERED: 'bg-green-100 text-green-700',
  NOT_INTERESTED: 'bg-red-100 text-red-600',
  NO_RESPONSE: 'bg-purple-100 text-purple-600',
};

interface VisitorForm {
  branchId: string;
  visitDate: string;
  visitType: 'IN_PERSON' | 'PHONE';
  childName: string;
  guardianName: string;
  guardianPhone?: string;
  childDob?: string;
  gradeLevel?: string;
  heardAboutUs?: string;
  tookTour: string; // 'true' | 'false' from select
  tourAccompaniedBy?: string;
  guardianFeedback?: string;
  notes?: string;
  followUpStatus: string;
}

export default function VisitorsPage() {
  const queryClient = useQueryClient();
  const { t, dir } = useLanguage();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const canEdit = user?.role === 'SUPER_ADMIN' || user?.role === 'BRANCH_MANAGER';

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const addForm = useForm<VisitorForm>();
  const editForm = useForm<VisitorForm>();

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => (await api.get('/branches')).data,
    enabled: isSuperAdmin,
  });

  const { data: visitors, isLoading } = useQuery({
    queryKey: ['visitors', branchFilter, statusFilter],
    queryFn: async () => {
      const params: any = {};
      if (branchFilter) params.branchId = branchFilter;
      if (statusFilter) params.followUpStatus = statusFilter;
      return (await api.get('/visitors', { params })).data;
    },
  });

  const toPayload = (data: VisitorForm) => ({
    branchId: isSuperAdmin ? data.branchId : user?.branchId || '',
    visitDate: data.visitDate,
    visitType: data.visitType,
    childName: data.childName,
    guardianName: data.guardianName,
    guardianPhone: data.guardianPhone || undefined,
    childDob: data.childDob || undefined,
    gradeLevel: data.gradeLevel || undefined,
    heardAboutUs: data.heardAboutUs || undefined,
    tookTour: data.tookTour === 'true',
    tourAccompaniedBy: data.tourAccompaniedBy || undefined,
    guardianFeedback: data.guardianFeedback || undefined,
    notes: data.notes || undefined,
    followUpStatus: data.followUpStatus,
  });

  const createMutation = useMutation({
    mutationFn: (data: VisitorForm) => api.post('/visitors', toPayload(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
      setIsAddOpen(false);
      addForm.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: VisitorForm }) => {
      const { branchId, ...payload } = toPayload(data);
      return api.patch(`/visitors/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/visitors/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['visitors'] }),
  });

  const openEdit = (v: any) => {
    setEditing(v);
    editForm.reset({
      visitDate: new Date(v.visitDate).toISOString().slice(0, 10),
      visitType: v.visitType,
      childName: v.childName,
      guardianName: v.guardianName,
      guardianPhone: v.guardianPhone || '',
      childDob: v.childDob ? new Date(v.childDob).toISOString().slice(0, 10) : '',
      gradeLevel: v.gradeLevel || '',
      heardAboutUs: v.heardAboutUs || '',
      tookTour: v.tookTour ? 'true' : 'false',
      tourAccompaniedBy: v.tourAccompaniedBy || '',
      guardianFeedback: v.guardianFeedback || '',
      notes: v.notes || '',
      followUpStatus: v.followUpStatus,
    });
  };

  if (isLoading) return <LoadingSpinner />;

  const records = visitors || [];

  const statusLabel = (s: string) => (t.visitors as any)[`status${s}`] || s;

  const inputCls =
    'w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm';

  const VisitorFormFields = ({ form, isEdit }: { form: any; isEdit: boolean }) => (
    <>
      {isSuperAdmin && !isEdit && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.visitors.branch}</label>
          <select {...form.register('branchId', { required: true })} className={`${inputCls} bg-white`}>
            {(branches || []).map((b: any) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.visitors.visitDate}</label>
          <input type="date" {...form.register('visitDate', { required: true })} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.visitors.visitType}</label>
          <select {...form.register('visitType', { required: true })} className={`${inputCls} bg-white`}>
            <option value="IN_PERSON">{t.visitors.inPerson}</option>
            <option value="PHONE">{t.visitors.phoneInquiry}</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.visitors.childName}</label>
          <input {...form.register('childName', { required: true })} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.visitors.childDob}</label>
          <input type="date" {...form.register('childDob')} className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.visitors.guardianName}</label>
          <input {...form.register('guardianName', { required: true })} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.visitors.guardianPhone}</label>
          <input {...form.register('guardianPhone')} className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.visitors.gradeLevel}</label>
          <select {...form.register('gradeLevel')} className={`${inputCls} bg-white`}>
            <option value="">—</option>
            <option value="NURSERY">Nursery</option>
            <option value="KG1">KG1</option>
            <option value="KG2">KG2</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.visitors.heardAboutUs}</label>
          <input {...form.register('heardAboutUs')} placeholder={t.visitors.heardPlaceholder} className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.visitors.tookTour}</label>
          <select {...form.register('tookTour')} className={`${inputCls} bg-white`}>
            <option value="false">{t.visitors.tourNo}</option>
            <option value="true">{t.visitors.tourYes}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.visitors.tourAccompaniedBy}</label>
          <input {...form.register('tourAccompaniedBy')} className={inputCls} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">{t.visitors.guardianFeedback}</label>
        <textarea {...form.register('guardianFeedback')} rows={2} className={inputCls} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.visitors.notes}</label>
          <input {...form.register('notes')} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.visitors.followUpStatus}</label>
          <select {...form.register('followUpStatus')} className={`${inputCls} bg-white`}>
            {FOLLOW_UP_STATUSES.map((s) => (
              <option key={s} value={s}>{statusLabel(s)}</option>
            ))}
          </select>
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{t.visitors.title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {t.visitors.subtitle.replace('{count}', String(records.length))}
          </p>
        </div>
        <button
          onClick={() => { setIsAddOpen(true); addForm.reset({ visitType: 'IN_PERSON', tookTour: 'false', followUpStatus: 'PENDING', visitDate: new Date().toISOString().slice(0, 10) }); }}
          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:opacity-90 transition"
          style={{ background: 'linear-gradient(135deg, #0f4c75, #1b6ca8)' }}
        >
          <Plus size={18} />
          {t.visitors.addVisitor}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {isSuperAdmin && (
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t.visitors.allBranches}</option>
            {(branches || []).map((b: any) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        )}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{t.visitors.allStatuses}</option>
          {FOLLOW_UP_STATUSES.map((s) => (
            <option key={s} value={s}>{statusLabel(s)}</option>
          ))}
        </select>
      </div>

      {/* Visitors table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        {records.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            <ClipboardList size={32} className="mx-auto mb-2 opacity-40" />
            {t.visitors.noVisitors}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-xs">
                <th className="px-4 py-3 text-start font-semibold">{t.visitors.visitDate}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.visitors.visitType}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.visitors.childName}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.visitors.guardianName}</th>
                {isSuperAdmin && <th className="px-4 py-3 text-start font-semibold">{t.visitors.branch}</th>}
                <th className="px-4 py-3 text-start font-semibold">{t.visitors.gradeLevel}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.visitors.tookTour}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.visitors.followUpStatus}</th>
                {canEdit && <th className="px-4 py-3 text-start font-semibold">{t.visitors.actions}</th>}
              </tr>
            </thead>
            <tbody>
              {records.map((v: any) => (
                <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-700">{new Date(v.visitDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      {v.visitType === 'PHONE'
                        ? <><Phone size={14} className="text-purple-500" />{t.visitors.phoneInquiry}</>
                        : <><Footprints size={14} className="text-teal-500" />{t.visitors.inPerson}</>}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{v.childName}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {v.guardianName}
                    {v.guardianPhone && <p className="text-xs text-gray-400" dir="ltr">{v.guardianPhone}</p>}
                  </td>
                  {isSuperAdmin && <td className="px-4 py-3 text-gray-600">{v.branch?.name || '—'}</td>}
                  <td className="px-4 py-3 text-gray-600">{v.gradeLevel || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{v.tookTour ? t.visitors.tourYes : t.visitors.tourNo}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[v.followUpStatus] || 'bg-gray-100 text-gray-600'}`}>
                      {statusLabel(v.followUpStatus)}
                    </span>
                  </td>
                  {canEdit && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(v)}
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition">
                          <Pencil size={16} />
                        </button>
                        {isSuperAdmin && (
                          <button
                            onClick={() => { if (confirm(t.visitors.deleteConfirm)) deleteMutation.mutate(v.id); }}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add modal */}
      <Modal isOpen={isAddOpen} title={t.visitors.addTitle} onClose={() => setIsAddOpen(false)} size="lg">
        <form onSubmit={addForm.handleSubmit((d) => createMutation.mutate(d))} className="space-y-4 max-h-[70vh] overflow-y-auto pe-1" dir={dir}>
          {VisitorFormFields({ form: addForm, isEdit: false })}
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setIsAddOpen(false)}
              className="px-4 py-2.5 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm font-medium">
              {t.visitors.cancelBtn}
            </button>
            <button type="submit" disabled={createMutation.isPending}
              className="px-5 py-2.5 text-white rounded-xl hover:opacity-90 transition text-sm font-semibold disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #0f4c75, #1b6ca8)' }}>
              {createMutation.isPending ? t.visitors.saving : t.visitors.addBtn}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={!!editing} title={t.visitors.editTitle} onClose={() => setEditing(null)} size="lg">
        <form
          onSubmit={editForm.handleSubmit((d) => editing && updateMutation.mutate({ id: editing.id, data: d }))}
          className="space-y-4 max-h-[70vh] overflow-y-auto pe-1"
          dir={dir}
        >
          {VisitorFormFields({ form: editForm, isEdit: true })}
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setEditing(null)}
              className="px-4 py-2.5 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm font-medium">
              {t.visitors.cancelBtn}
            </button>
            <button type="submit" disabled={updateMutation.isPending}
              className="px-5 py-2.5 text-white rounded-xl hover:opacity-90 transition text-sm font-semibold disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #0f4c75, #1b6ca8)' }}>
              {updateMutation.isPending ? t.visitors.saving : t.visitors.saveBtn}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
