'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Plus, ClipboardList, Phone, Footprints, Pencil, Trash2,
  MessageCircle, History, TrendingUp, Users, CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';

const FOLLOW_UP_STATUSES = [
  'PENDING',
  'CONTACTED',
  'INTERESTED',
  'RESCHEDULED',
  'REGISTERED',
  'NOT_INTERESTED',
  'NO_RESPONSE',
] as const;

const VISIT_TYPES = ['IN_PERSON', 'PHONE', 'WHATSAPP'] as const;

const REFERRAL_SOURCES = [
  'SOCIAL_MEDIA',
  'BOOTH_CAMPAIGN',
  'FRIEND_WORD_OF_MOUTH',
  'PARENT_REFERRAL',
  'BANNER_OUTDOOR',
  'WALK_IN',
  'WHATSAPP',
  'GOOGLE_SEARCH',
  'OTHER',
] as const;

const PROGRAM_TYPES = ['ACADEMIC_YEAR', 'SUMMER_CAMP'] as const;

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-600',
  CONTACTED: 'bg-blue-100 text-blue-700',
  INTERESTED: 'bg-amber-100 text-amber-700',
  RESCHEDULED: 'bg-cyan-100 text-cyan-700',
  REGISTERED: 'bg-green-100 text-green-700',
  NOT_INTERESTED: 'bg-red-100 text-red-600',
  NO_RESPONSE: 'bg-purple-100 text-purple-600',
};

interface VisitorForm {
  branchId: string;
  visitDate: string;
  visitType: string;
  childName: string;
  guardianName: string;
  guardianPhone?: string;
  childDob?: string;
  gradeLevel?: string;
  heardAboutUs?: string;
  heardAboutUsDetail?: string;
  tookTour: string;
  tourAccompaniedBy?: string;
  handledBy?: string;
  guardianFeedback?: string;
  managementRemarks?: string;
  notes?: string;
  followUpStatus: string;
  targetBranch?: string;
  isTransfer: string;
  transferFrom?: string;
  programType?: string;
  academicYear?: string;
}

interface FollowUpForm {
  date: string;
  note?: string;
  result?: string;
}

export default function VisitorsPage() {
  const queryClient = useQueryClient();
  const { t, dir } = useLanguage();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const canEdit = user?.role === 'SUPER_ADMIN' || user?.role === 'BRANCH_MANAGER';

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [followUpsFor, setFollowUpsFor] = useState<any | null>(null);
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  const addForm = useForm<VisitorForm>();
  const editForm = useForm<VisitorForm>();
  const followUpForm = useForm<FollowUpForm>();

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => (await api.get('/branches')).data,
    enabled: isSuperAdmin,
  });

  const { data: visitors, isLoading } = useQuery({
    queryKey: ['visitors', branchFilter, statusFilter, typeFilter, sourceFilter],
    queryFn: async () => {
      const params: any = {};
      if (branchFilter) params.branchId = branchFilter;
      if (statusFilter) params.followUpStatus = statusFilter;
      if (typeFilter) params.visitType = typeFilter;
      if (sourceFilter) params.heardAboutUs = sourceFilter;
      return (await api.get('/visitors', { params })).data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['visitor-stats', branchFilter],
    queryFn: async () => {
      const params: any = {};
      if (branchFilter) params.branchId = branchFilter;
      return (await api.get('/visitors/stats/conversion', { params })).data;
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
    heardAboutUsDetail: data.heardAboutUsDetail || undefined,
    tookTour: data.tookTour === 'true',
    tourAccompaniedBy: data.tourAccompaniedBy || undefined,
    handledBy: data.handledBy || undefined,
    guardianFeedback: data.guardianFeedback || undefined,
    managementRemarks: data.managementRemarks || undefined,
    notes: data.notes || undefined,
    followUpStatus: data.followUpStatus,
    targetBranch: data.targetBranch || undefined,
    isTransfer: data.isTransfer === 'true',
    transferFrom: data.isTransfer === 'true' ? data.transferFrom || undefined : undefined,
    programType: data.programType || undefined,
    academicYear: data.academicYear || undefined,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['visitors'] });
    queryClient.invalidateQueries({ queryKey: ['visitor-stats'] });
  };

  const createMutation = useMutation({
    mutationFn: (data: VisitorForm) => api.post('/visitors', toPayload(data)),
    onSuccess: () => {
      invalidate();
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
      invalidate();
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/visitors/${id}`),
    onSuccess: invalidate,
  });

  const addFollowUpMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FollowUpForm }) =>
      api.post(`/visitors/${id}/follow-ups`, {
        date: data.date,
        note: data.note || undefined,
        result: data.result || undefined,
      }),
    onSuccess: async (_res, vars) => {
      invalidate();
      followUpForm.reset({ date: new Date().toISOString().slice(0, 10), note: '', result: '' });
      const fresh = (await api.get(`/visitors/${vars.id}`)).data;
      setFollowUpsFor(fresh);
    },
  });

  const deleteFollowUpMutation = useMutation({
    mutationFn: ({ id, fid }: { id: string; fid: string }) =>
      api.delete(`/visitors/${id}/follow-ups/${fid}`),
    onSuccess: async (_res, vars) => {
      invalidate();
      const fresh = (await api.get(`/visitors/${vars.id}`)).data;
      setFollowUpsFor(fresh);
    },
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
      heardAboutUsDetail: v.heardAboutUsDetail || '',
      tookTour: v.tookTour ? 'true' : 'false',
      tourAccompaniedBy: v.tourAccompaniedBy || '',
      handledBy: v.handledBy || '',
      guardianFeedback: v.guardianFeedback || '',
      managementRemarks: v.managementRemarks || '',
      notes: v.notes || '',
      followUpStatus: v.followUpStatus,
      targetBranch: v.targetBranch || '',
      isTransfer: v.isTransfer ? 'true' : 'false',
      transferFrom: v.transferFrom || '',
      programType: v.programType || '',
      academicYear: v.academicYear || '',
    });
  };

  const openFollowUps = (v: any) => {
    setFollowUpsFor(v);
    followUpForm.reset({ date: new Date().toISOString().slice(0, 10), note: '', result: '' });
  };

  if (isLoading) return <LoadingSpinner />;

  const records = visitors || [];

  const statusLabel = (s: string) => (t.visitors as any)[`status${s}`] || s;
  const sourceLabel = (s: string) => (t.visitors as any)[`src${s}`] || s;
  const typeLabel = (s: string) =>
    s === 'PHONE' ? t.visitors.phoneInquiry : s === 'WHATSAPP' ? t.visitors.whatsappInquiry : t.visitors.inPerson;

  const TypeIcon = ({ type }: { type: string }) =>
    type === 'PHONE' ? (
      <Phone size={14} className="text-purple-500" />
    ) : type === 'WHATSAPP' ? (
      <MessageCircle size={14} className="text-green-500" />
    ) : (
      <Footprints size={14} className="text-teal-500" />
    );

  const inputCls =
    'w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm';
  const selectCls = `${inputCls} bg-white`;
  const labelCls = 'block text-sm font-semibold text-gray-700 mb-1';

  const VisitorFormFields = ({ form, isEdit }: { form: any; isEdit: boolean }) => (
    <>
      {isSuperAdmin && !isEdit && (
        <div>
          <label className={labelCls}>{t.visitors.branch}</label>
          <select {...form.register('branchId', { required: true })} className={selectCls}>
            {(branches || []).map((b: any) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>{t.visitors.visitDate}</label>
          <input type="date" {...form.register('visitDate', { required: true })} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>{t.visitors.visitType}</label>
          <select {...form.register('visitType', { required: true })} className={selectCls}>
            <option value="IN_PERSON">{t.visitors.inPerson}</option>
            <option value="PHONE">{t.visitors.phoneInquiry}</option>
            <option value="WHATSAPP">{t.visitors.whatsappInquiry}</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>{t.visitors.childName}</label>
          <input {...form.register('childName', { required: true })} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>{t.visitors.childDob}</label>
          <input type="date" {...form.register('childDob')} className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>{t.visitors.guardianName}</label>
          <input {...form.register('guardianName', { required: true })} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>{t.visitors.guardianPhone}</label>
          <input {...form.register('guardianPhone')} className={inputCls} dir="ltr" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>{t.visitors.gradeLevel}</label>
          <select {...form.register('gradeLevel')} className={selectCls}>
            <option value="">—</option>
            <option value="NURSERY">Nursery</option>
            <option value="PRE_KG">Pre-KG</option>
            <option value="KG1">KG1</option>
            <option value="KG2">KG2</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>{t.visitors.heardAboutUs}</label>
          <select {...form.register('heardAboutUs')} className={selectCls}>
            <option value="">—</option>
            {REFERRAL_SOURCES.map((s) => (
              <option key={s} value={s}>{sourceLabel(s)}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className={labelCls}>{t.visitors.heardDetail}</label>
        <input {...form.register('heardAboutUsDetail')} placeholder={t.visitors.heardPlaceholder} className={inputCls} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>{t.visitors.programType}</label>
          <select {...form.register('programType')} className={selectCls}>
            <option value="">—</option>
            <option value="ACADEMIC_YEAR">{t.visitors.progACADEMIC_YEAR}</option>
            <option value="SUMMER_CAMP">{t.visitors.progSUMMER_CAMP}</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>{t.visitors.academicYear}</label>
          <input {...form.register('academicYear')} placeholder="2026–2027" className={inputCls} dir="ltr" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>{t.visitors.targetBranch}</label>
          {isSuperAdmin ? (
            <select {...form.register('targetBranch')} className={selectCls}>
              <option value="">—</option>
              {(branches || []).map((b: any) => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          ) : (
            <input {...form.register('targetBranch')} className={inputCls} />
          )}
        </div>
        <div>
          <label className={labelCls}>{t.visitors.isTransfer}</label>
          <select {...form.register('isTransfer')} className={selectCls}>
            <option value="false">{t.visitors.tourNo}</option>
            <option value="true">{t.visitors.tourYes}</option>
          </select>
        </div>
      </div>
      {form.watch('isTransfer') === 'true' && (
        <div>
          <label className={labelCls}>{t.visitors.transferFrom}</label>
          <input {...form.register('transferFrom')} className={inputCls} />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>{t.visitors.tookTour}</label>
          <select {...form.register('tookTour')} className={selectCls}>
            <option value="false">{t.visitors.tourNo}</option>
            <option value="true">{t.visitors.tourYes}</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>{t.visitors.tourAccompaniedBy}</label>
          <input {...form.register('tourAccompaniedBy')} className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>{t.visitors.handledBy}</label>
          <input {...form.register('handledBy')} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>{t.visitors.followUpStatus}</label>
          <select {...form.register('followUpStatus')} className={selectCls}>
            {FOLLOW_UP_STATUSES.map((s) => (
              <option key={s} value={s}>{statusLabel(s)}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className={labelCls}>{t.visitors.guardianFeedback}</label>
        <textarea {...form.register('guardianFeedback')} rows={2} className={inputCls} />
      </div>
      {canEdit && (
        <div>
          <label className={labelCls}>{t.visitors.managementRemarks}</label>
          <textarea {...form.register('managementRemarks')} rows={2} className={inputCls} />
        </div>
      )}
      <div>
        <label className={labelCls}>{t.visitors.notes}</label>
        <input {...form.register('notes')} className={inputCls} />
      </div>
    </>
  );

  const gradient = { background: 'linear-gradient(135deg, #0f4c75, #1b6ca8)' };

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
          onClick={() => {
            setIsAddOpen(true);
            addForm.reset({
              visitType: 'IN_PERSON', tookTour: 'false', isTransfer: 'false',
              followUpStatus: 'PENDING', visitDate: new Date().toISOString().slice(0, 10),
            });
          }}
          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:opacity-90 transition"
          style={gradient}
        >
          <Plus size={18} />
          {t.visitors.addVisitor}
        </button>
      </div>

      {/* Conversion stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600"><Users size={20} /></div>
            <div>
              <p className="text-xs text-gray-500 font-semibold">{t.visitors.totalInquiries}</p>
              <p className="text-xl font-black text-gray-900">{stats.total}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-50 text-green-600"><CheckCircle2 size={20} /></div>
            <div>
              <p className="text-xs text-gray-500 font-semibold">{t.visitors.registeredCount}</p>
              <p className="text-xl font-black text-gray-900">{stats.registered}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><TrendingUp size={20} /></div>
            <div>
              <p className="text-xs text-gray-500 font-semibold">{t.visitors.conversionRate}</p>
              <p className="text-xl font-black text-gray-900">{stats.conversionRate}%</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-semibold mb-1.5">{t.visitors.topSources}</p>
            <div className="space-y-0.5">
              {Object.entries(stats.bySource || {})
                .filter(([k]) => k !== 'UNKNOWN')
                .sort((a: any, b: any) => b[1].total - a[1].total)
                .slice(0, 2)
                .map(([k, v]: any) => (
                  <p key={k} className="text-xs text-gray-700 flex justify-between gap-2">
                    <span className="truncate">{sourceLabel(k)}</span>
                    <span className="font-bold shrink-0">{v.total}</span>
                  </p>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {isSuperAdmin && (
          <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">{t.visitors.allBranches}</option>
            {(branches || []).map((b: any) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        )}
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">{t.visitors.allStatuses}</option>
          {FOLLOW_UP_STATUSES.map((s) => (
            <option key={s} value={s}>{statusLabel(s)}</option>
          ))}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">{t.visitors.allTypes}</option>
          {VISIT_TYPES.map((s) => (
            <option key={s} value={s}>{typeLabel(s)}</option>
          ))}
        </select>
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">{t.visitors.allSources}</option>
          {REFERRAL_SOURCES.map((s) => (
            <option key={s} value={s}>{sourceLabel(s)}</option>
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
                <th className="px-4 py-3 text-start font-semibold">{t.visitors.heardAboutUs}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.visitors.targetBranch}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.visitors.programType}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.visitors.followUpStatus}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.visitors.actions}</th>
              </tr>
            </thead>
            <tbody>
              {records.map((v: any) => (
                <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-700">{new Date(v.visitDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <TypeIcon type={v.visitType} />
                      {typeLabel(v.visitType)}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {v.childName}
                    {v.gradeLevel && <p className="text-xs text-gray-400 font-normal">{v.gradeLevel.replace('_', '-')}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {v.guardianName}
                    {v.guardianPhone && <p className="text-xs text-gray-400" dir="ltr">{v.guardianPhone}</p>}
                  </td>
                  {isSuperAdmin && <td className="px-4 py-3 text-gray-600">{v.branch?.name || '—'}</td>}
                  <td className="px-4 py-3 text-gray-600">
                    {v.heardAboutUs ? sourceLabel(v.heardAboutUs) : '—'}
                    {v.heardAboutUsDetail && <p className="text-xs text-gray-400">{v.heardAboutUsDetail}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {v.targetBranch || '—'}
                    {v.isTransfer && (
                      <p className="text-xs text-amber-600 font-semibold">
                        {t.visitors.transferBadge}{v.transferFrom ? `: ${v.transferFrom}` : ''}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {v.programType === 'SUMMER_CAMP'
                      ? t.visitors.progSUMMER_CAMP
                      : v.programType === 'ACADEMIC_YEAR'
                        ? t.visitors.progACADEMIC_YEAR
                        : '—'}
                    {v.academicYear && <p className="text-xs text-gray-400" dir="ltr">{v.academicYear}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[v.followUpStatus] || 'bg-gray-100 text-gray-600'}`}>
                      {statusLabel(v.followUpStatus)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openFollowUps(v)} title={t.visitors.followUps}
                        className="relative p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition">
                        <History size={16} />
                        {(v.followUps?.length || 0) > 0 && (
                          <span className="absolute -top-0.5 -end-0.5 text-[10px] font-bold bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center">
                            {v.followUps.length}
                          </span>
                        )}
                      </button>
                      {canEdit && (
                        <button onClick={() => openEdit(v)}
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition">
                          <Pencil size={16} />
                        </button>
                      )}
                      {isSuperAdmin && (
                        <button
                          onClick={() => { if (confirm(t.visitors.deleteConfirm)) deleteMutation.mutate(v.id); }}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
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
              style={gradient}>
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
              style={gradient}>
              {updateMutation.isPending ? t.visitors.saving : t.visitors.saveBtn}
            </button>
          </div>
        </form>
      </Modal>

      {/* Follow-ups modal */}
      <Modal
        isOpen={!!followUpsFor}
        title={`${t.visitors.followUps} — ${followUpsFor?.childName || ''}`}
        onClose={() => setFollowUpsFor(null)}
        size="lg"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pe-1" dir={dir}>
          {(followUpsFor?.followUps?.length || 0) === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">{t.visitors.noFollowUps}</p>
          ) : (
            <div className="space-y-2">
              {(followUpsFor?.followUps || []).map((f: any, idx: number) => (
                <div key={f.id} className="flex items-start justify-between gap-3 bg-gray-50 rounded-xl p-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-500">
                      {t.visitors.followUpN.replace('{n}', String(idx + 1))} — {new Date(f.date).toLocaleDateString()}
                    </p>
                    {f.note && <p className="text-sm text-gray-700 mt-0.5">{f.note}</p>}
                    {f.result && (
                      <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[f.result] || 'bg-gray-100 text-gray-600'}`}>
                        {statusLabel(f.result)}
                      </span>
                    )}
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => deleteFollowUpMutation.mutate({ id: followUpsFor.id, fid: f.id })}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition shrink-0">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <form
            onSubmit={followUpForm.handleSubmit((d) =>
              followUpsFor && addFollowUpMutation.mutate({ id: followUpsFor.id, data: d }),
            )}
            className="border-t border-gray-100 pt-4 space-y-3"
          >
            <p className="text-sm font-bold text-gray-800">{t.visitors.addFollowUp}</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>{t.visitors.followUpDate}</label>
                <input type="date" {...followUpForm.register('date', { required: true })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{t.visitors.followUpResult}</label>
                <select {...followUpForm.register('result')} className={selectCls}>
                  <option value="">—</option>
                  {FOLLOW_UP_STATUSES.map((s) => (
                    <option key={s} value={s}>{statusLabel(s)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>{t.visitors.followUpNote}</label>
              <textarea {...followUpForm.register('note')} rows={2} className={inputCls} />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={addFollowUpMutation.isPending}
                className="px-5 py-2.5 text-white rounded-xl hover:opacity-90 transition text-sm font-semibold disabled:opacity-50"
                style={gradient}>
                {addFollowUpMutation.isPending ? t.visitors.saving : t.visitors.addFollowUpBtn}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
