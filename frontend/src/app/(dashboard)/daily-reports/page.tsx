'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Plus, ClipboardCheck, Wand2, AlertTriangle, Pencil, Trash2,
  Building2, CheckCircle2, CircleAlert,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';

const OVERALL_STATUSES = ['EXCELLENT', 'GOOD', 'NEEDS_ATTENTION', 'CRITICAL'] as const;
const DEPARTMENTS = ['OPERATIONS', 'STUDENTS', 'PARENTS', 'STAFF', 'MAINTENANCE', 'ENROLLMENT', 'OTHER'] as const;
const ISSUE_TYPES = [
  'RESIGNATION', 'TERMINATION', 'STUDENT_INCIDENT', 'STUDENT_ABSENCE',
  'PARENT_COMPLAINT', 'PARENT_SUGGESTION', 'STAFF_ABSENCE', 'STAFF_CONDUCT',
  'MAINTENANCE_ISSUE', 'REQUEST', 'OTHER',
] as const;
const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
const ISSUE_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED'] as const;
const CRITICAL_TYPES = ['RESIGNATION', 'TERMINATION', 'STUDENT_INCIDENT'];

const OVERALL_COLORS: Record<string, string> = {
  EXCELLENT: 'bg-green-100 text-green-700',
  GOOD: 'bg-blue-100 text-blue-700',
  NEEDS_ATTENTION: 'bg-amber-100 text-amber-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

const SEVERITY_COLORS: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-amber-100 text-amber-700',
  URGENT: 'bg-red-100 text-red-700',
};

const ISSUE_STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-red-50 text-red-600',
  IN_PROGRESS: 'bg-amber-50 text-amber-600',
  RESOLVED: 'bg-green-50 text-green-600',
};

const NUMERIC_FIELDS = [
  'childrenPresent', 'studentAbsenceIssues', 'parentComplaints', 'newInquiries',
  'staffAbsences', 'staffConductIssues', 'maintenanceIssues', 'newEnrollments', 'withdrawals',
] as const;

interface ReportForm {
  branchId: string;
  date: string;
  managerName?: string;
  childrenPresent: number;
  studentAbsenceIssues: number;
  parentComplaints: number;
  newInquiries: number;
  staffAbsences: number;
  staffConductIssues: number;
  maintenanceIssues: number;
  newEnrollments: number;
  withdrawals: number;
  overallStatus: string;
  highlights?: string;
}

interface IssueForm {
  branchId: string;
  date: string;
  department: string;
  issueType: string;
  description: string;
  personInvolved?: string;
  severity: string;
  status: string;
  actionTaken?: string;
  needsFollowUp: string;
  followUpDate?: string;
  notes?: string;
}

export default function DailyReportsPage() {
  const queryClient = useQueryClient();
  const { t, dir } = useLanguage();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const canEdit = user?.role === 'SUPER_ADMIN' || user?.role === 'BRANCH_MANAGER';

  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<any | null>(null);
  const [issueStatusFilter, setIssueStatusFilter] = useState('');
  const [issueBranchFilter, setIssueBranchFilter] = useState('');

  const reportForm = useForm<ReportForm>();
  const issueForm = useForm<IssueForm>();

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => (await api.get('/branches')).data,
    enabled: isSuperAdmin,
  });

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['daily-reports-overview', selectedDate],
    queryFn: async () => (await api.get('/daily-reports/overview', { params: { date: selectedDate } })).data,
    enabled: isSuperAdmin,
  });

  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ['daily-reports', selectedDate],
    queryFn: async () =>
      (await api.get('/daily-reports', { params: { from: selectedDate, to: selectedDate } })).data,
    enabled: !isSuperAdmin,
  });

  const { data: issues, isLoading: issuesLoading } = useQuery({
    queryKey: ['branch-issues', issueStatusFilter, issueBranchFilter],
    queryFn: async () => {
      const params: any = {};
      if (issueStatusFilter) params.status = issueStatusFilter;
      if (issueBranchFilter) params.branchId = issueBranchFilter;
      return (await api.get('/daily-reports/issues', { params })).data;
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['daily-reports'] });
    queryClient.invalidateQueries({ queryKey: ['daily-reports-overview'] });
    queryClient.invalidateQueries({ queryKey: ['branch-issues'] });
  };

  const upsertReportMutation = useMutation({
    mutationFn: (data: ReportForm) =>
      api.post('/daily-reports', {
        ...data,
        branchId: isSuperAdmin ? data.branchId : user?.branchId || '',
        ...Object.fromEntries(NUMERIC_FIELDS.map((f) => [f, Number(data[f]) || 0])),
        managerName: data.managerName || undefined,
        highlights: data.highlights || undefined,
      }),
    onSuccess: () => {
      invalidate();
      setIsReportOpen(false);
    },
  });

  const createIssueMutation = useMutation({
    mutationFn: (data: IssueForm) =>
      api.post('/daily-reports/issues', {
        branchId: isSuperAdmin ? data.branchId : user?.branchId || '',
        date: data.date,
        department: data.department,
        issueType: data.issueType,
        description: data.description,
        personInvolved: data.personInvolved || undefined,
        severity: data.severity,
        status: data.status,
        actionTaken: data.actionTaken || undefined,
        needsFollowUp: data.needsFollowUp === 'true',
        followUpDate: data.needsFollowUp === 'true' ? data.followUpDate || undefined : undefined,
        notes: data.notes || undefined,
      }),
    onSuccess: () => {
      invalidate();
      setIsIssueOpen(false);
      issueForm.reset();
    },
  });

  const updateIssueMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: IssueForm }) =>
      api.patch(`/daily-reports/issues/${id}`, {
        date: data.date,
        department: data.department,
        issueType: data.issueType,
        description: data.description,
        personInvolved: data.personInvolved || undefined,
        severity: data.severity,
        status: data.status,
        actionTaken: data.actionTaken || undefined,
        needsFollowUp: data.needsFollowUp === 'true',
        followUpDate: data.needsFollowUp === 'true' ? data.followUpDate || undefined : undefined,
        notes: data.notes || undefined,
      }),
    onSuccess: () => {
      invalidate();
      setEditingIssue(null);
    },
  });

  const deleteIssueMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/daily-reports/issues/${id}`),
    onSuccess: invalidate,
  });

  const dr = t.dailyReport as any;

  const openReport = async (branchId?: string, existing?: any) => {
    const bId = branchId || user?.branchId || '';
    let base: any = existing;
    if (!base) {
      const myReports = isSuperAdmin
        ? (overview?.branches || []).find((b: any) => b.id === bId)?.report
        : (reports || [])[0];
      base = myReports || null;
    }
    reportForm.reset({
      branchId: bId,
      date: selectedDate,
      managerName: base?.managerName || user?.name || '',
      childrenPresent: base?.childrenPresent ?? 0,
      studentAbsenceIssues: base?.studentAbsenceIssues ?? 0,
      parentComplaints: base?.parentComplaints ?? 0,
      newInquiries: base?.newInquiries ?? 0,
      staffAbsences: base?.staffAbsences ?? 0,
      staffConductIssues: base?.staffConductIssues ?? 0,
      maintenanceIssues: base?.maintenanceIssues ?? 0,
      newEnrollments: base?.newEnrollments ?? 0,
      withdrawals: base?.withdrawals ?? 0,
      overallStatus: base?.overallStatus || 'GOOD',
      highlights: base?.highlights || '',
    });
    setIsReportOpen(true);
  };

  const autofill = async () => {
    const branchId = reportForm.getValues('branchId') || user?.branchId || '';
    const date = reportForm.getValues('date') || selectedDate;
    try {
      const { data } = await api.get('/daily-reports/autofill', { params: { branchId, date } });
      for (const key of Object.keys(data)) {
        reportForm.setValue(key as any, data[key]);
      }
    } catch {
      /* silent */
    }
  };

  const openIssueAdd = () => {
    issueForm.reset({
      branchId: isSuperAdmin ? (branches?.[0]?.id || '') : user?.branchId || '',
      date: today,
      department: 'OPERATIONS',
      issueType: 'OTHER',
      severity: 'MEDIUM',
      status: 'OPEN',
      needsFollowUp: 'false',
      description: '',
    });
    setIsIssueOpen(true);
  };

  const openIssueEdit = (issue: any) => {
    setEditingIssue(issue);
    issueForm.reset({
      branchId: issue.branchId,
      date: new Date(issue.date).toISOString().slice(0, 10),
      department: issue.department,
      issueType: issue.issueType,
      description: issue.description,
      personInvolved: issue.personInvolved || '',
      severity: issue.severity,
      status: issue.status,
      actionTaken: issue.actionTaken || '',
      needsFollowUp: issue.needsFollowUp ? 'true' : 'false',
      followUpDate: issue.followUpDate ? new Date(issue.followUpDate).toISOString().slice(0, 10) : '',
      notes: issue.notes || '',
    });
  };

  const isLoading = isSuperAdmin ? overviewLoading : reportsLoading;
  if (isLoading || issuesLoading) return <LoadingSpinner />;

  const statusLabel = (s: string) => dr[`overall${s}`] || s;
  const deptLabel = (s: string) => dr[`dept${s}`] || s;
  const typeLabel = (s: string) => dr[`type${s}`] || s;
  const sevLabel = (s: string) => dr[`sev${s}`] || s;
  const issueStatusLabel = (s: string) => dr[`istatus${s}`] || s;

  const inputCls =
    'w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm';
  const selectCls = `${inputCls} bg-white`;
  const labelCls = 'block text-sm font-semibold text-gray-700 mb-1';
  const gradient = { background: 'linear-gradient(135deg, #0f4c75, #1b6ca8)' };

  const myReport = !isSuperAdmin ? (reports || [])[0] : null;
  const issueRecords = issues || [];

  const numericField = (name: string) => (
    <div key={name}>
      <label className={labelCls}>{dr[name]}</label>
      <input type="number" min={0} {...reportForm.register(name as any)} className={inputCls} />
    </div>
  );

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{dr.title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{dr.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
          />
          {canEdit && !isSuperAdmin && (
            <button
              onClick={() => openReport()}
              className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:opacity-90 transition"
              style={gradient}
            >
              <ClipboardCheck size={18} />
              {myReport ? dr.editReport : dr.fillReport}
            </button>
          )}
        </div>
      </div>

      {/* SUPER_ADMIN: branches overview */}
      {isSuperAdmin && overview && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600"><Building2 size={20} /></div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">{dr.submittedReports}</p>
                <p className="text-xl font-black text-gray-900">
                  {overview.submittedCount}/{overview.totalBranches}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-50 text-red-600"><CircleAlert size={20} /></div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">{dr.openIssues}</p>
                <p className="text-xl font-black text-gray-900">{overview.openIssuesCount}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><AlertTriangle size={20} /></div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">{dr.needsFollowUpCount}</p>
                <p className="text-xl font-black text-gray-900">{overview.needsFollowUpCount}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-50 text-green-600"><CheckCircle2 size={20} /></div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">{dr.dateLabel}</p>
                <p className="text-base font-black text-gray-900" dir="ltr">{overview.date}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {overview.branches.map((b: any) => (
              <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-gray-900">{b.name}</p>
                  {b.report ? (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${OVERALL_COLORS[b.report.overallStatus]}`}>
                      {statusLabel(b.report.overallStatus)}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                      {dr.notSubmitted}
                    </span>
                  )}
                </div>
                {b.report ? (
                  <>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-gray-50 rounded-xl py-2">
                        <p className="text-lg font-black text-gray-900">{b.report.childrenPresent}</p>
                        <p className="text-[10px] text-gray-500 font-semibold">{dr.childrenPresentShort}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl py-2">
                        <p className="text-lg font-black text-gray-900">{b.report.newEnrollments}</p>
                        <p className="text-[10px] text-gray-500 font-semibold">{dr.newEnrollmentsShort}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl py-2">
                        <p className="text-lg font-black text-gray-900">{b.report.parentComplaints}</p>
                        <p className="text-[10px] text-gray-500 font-semibold">{dr.parentComplaintsShort}</p>
                      </div>
                    </div>
                    {b.report.highlights && (
                      <p className="text-xs text-gray-500 line-clamp-2">{b.report.highlights}</p>
                    )}
                    <button
                      onClick={() => openReport(b.id, b.report)}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      {dr.viewEdit}
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-gray-400">{dr.noReportYet}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* BRANCH view: my report summary */}
      {!isSuperAdmin && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          {myReport ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-bold text-gray-900">{dr.todaySummary}</p>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${OVERALL_COLORS[myReport.overallStatus]}`}>
                  {statusLabel(myReport.overallStatus)}
                </span>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 text-center">
                {NUMERIC_FIELDS.map((f) => (
                  <div key={f} className="bg-gray-50 rounded-xl py-2 px-1">
                    <p className="text-lg font-black text-gray-900">{myReport[f]}</p>
                    <p className="text-[10px] text-gray-500 font-semibold leading-tight">{dr[f]}</p>
                  </div>
                ))}
              </div>
              {myReport.highlights && <p className="text-sm text-gray-600">{myReport.highlights}</p>}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400 text-sm">
              <ClipboardCheck size={32} className="mx-auto mb-2 opacity-40" />
              {dr.noReportYet}
            </div>
          )}
        </div>
      )}

      {/* Issues log */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black text-gray-900">{dr.issuesTitle}</h2>
          <div className="flex flex-wrap items-center gap-2">
            {isSuperAdmin && (
              <select value={issueBranchFilter} onChange={(e) => setIssueBranchFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">{t.visitors.allBranches}</option>
                {(branches || []).map((b: any) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            )}
            <select value={issueStatusFilter} onChange={(e) => setIssueStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">{dr.allIssueStatuses}</option>
              {ISSUE_STATUSES.map((s) => (
                <option key={s} value={s}>{issueStatusLabel(s)}</option>
              ))}
            </select>
            <button
              onClick={openIssueAdd}
              className="flex items-center gap-1.5 text-white px-3.5 py-2 rounded-xl text-sm font-semibold shadow-sm hover:opacity-90 transition"
              style={gradient}
            >
              <Plus size={16} />
              {dr.addIssue}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          {issueRecords.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">
              <CheckCircle2 size={32} className="mx-auto mb-2 opacity-40" />
              {dr.noIssues}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 text-xs">
                  <th className="px-4 py-3 text-start font-semibold">{t.common.date}</th>
                  {isSuperAdmin && <th className="px-4 py-3 text-start font-semibold">{t.visitors.branch}</th>}
                  <th className="px-4 py-3 text-start font-semibold">{dr.department}</th>
                  <th className="px-4 py-3 text-start font-semibold">{dr.issueType}</th>
                  <th className="px-4 py-3 text-start font-semibold">{t.common.description}</th>
                  <th className="px-4 py-3 text-start font-semibold">{dr.severity}</th>
                  <th className="px-4 py-3 text-start font-semibold">{t.common.status}</th>
                  <th className="px-4 py-3 text-start font-semibold">{dr.followUp}</th>
                  <th className="px-4 py-3 text-start font-semibold">{t.visitors.actions}</th>
                </tr>
              </thead>
              <tbody>
                {issueRecords.map((issue: any) => {
                  const critical = CRITICAL_TYPES.includes(issue.issueType);
                  return (
                    <tr key={issue.id}
                      className={`border-b border-gray-50 transition ${critical ? 'bg-red-50/60 hover:bg-red-50' : 'hover:bg-gray-50'}`}>
                      <td className="px-4 py-3 text-gray-700">{new Date(issue.date).toLocaleDateString()}</td>
                      {isSuperAdmin && <td className="px-4 py-3 text-gray-600">{issue.branch?.name || '—'}</td>}
                      <td className="px-4 py-3 text-gray-600">{deptLabel(issue.department)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 font-semibold ${critical ? 'text-red-700' : 'text-gray-700'}`}>
                          {critical && <AlertTriangle size={13} />}
                          {typeLabel(issue.issueType)}
                        </span>
                        {issue.personInvolved && (
                          <p className="text-xs text-gray-400">{issue.personInvolved}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[260px]">
                        <p className="line-clamp-2">{issue.description}</p>
                        {issue.actionTaken && (
                          <p className="text-xs text-gray-400 line-clamp-1">{dr.actionTaken}: {issue.actionTaken}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${SEVERITY_COLORS[issue.severity]}`}>
                          {sevLabel(issue.severity)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ISSUE_STATUS_COLORS[issue.status]}`}>
                          {issueStatusLabel(issue.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {issue.needsFollowUp ? (
                          <span className="text-amber-600 font-semibold text-xs">
                            {t.visitors.tourYes}
                            {issue.followUpDate && (
                              <p className="text-gray-400 font-normal">{new Date(issue.followUpDate).toLocaleDateString()}</p>
                            )}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">{t.visitors.tourNo}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {canEdit && (
                            <button onClick={() => openIssueEdit(issue)}
                              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition">
                              <Pencil size={16} />
                            </button>
                          )}
                          {isSuperAdmin && (
                            <button
                              onClick={() => { if (confirm(dr.deleteIssueConfirm)) deleteIssueMutation.mutate(issue.id); }}
                              className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Daily report modal */}
      <Modal isOpen={isReportOpen} title={dr.reportModalTitle} onClose={() => setIsReportOpen(false)} size="lg">
        <form
          onSubmit={reportForm.handleSubmit((d) => upsertReportMutation.mutate(d))}
          className="space-y-4 max-h-[70vh] overflow-y-auto pe-1"
          dir={dir}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="grid grid-cols-2 gap-3 flex-1">
              <div>
                <label className={labelCls}>{t.common.date}</label>
                <input type="date" {...reportForm.register('date', { required: true })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{dr.managerName}</label>
                <input {...reportForm.register('managerName')} className={inputCls} />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={autofill}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
          >
            <Wand2 size={16} />
            {dr.autofillBtn}
          </button>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {NUMERIC_FIELDS.map((f) => numericField(f))}
          </div>
          <div>
            <label className={labelCls}>{dr.overallStatus}</label>
            <select {...reportForm.register('overallStatus')} className={selectCls}>
              {OVERALL_STATUSES.map((s) => (
                <option key={s} value={s}>{statusLabel(s)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>{dr.highlights}</label>
            <textarea {...reportForm.register('highlights')} rows={3} className={inputCls} placeholder={dr.highlightsPlaceholder} />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setIsReportOpen(false)}
              className="px-4 py-2.5 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm font-medium">
              {t.visitors.cancelBtn}
            </button>
            <button type="submit" disabled={upsertReportMutation.isPending}
              className="px-5 py-2.5 text-white rounded-xl hover:opacity-90 transition text-sm font-semibold disabled:opacity-50"
              style={gradient}>
              {upsertReportMutation.isPending ? t.visitors.saving : dr.submitReport}
            </button>
          </div>
        </form>
      </Modal>

      {/* Issue add/edit modal */}
      <Modal
        isOpen={isIssueOpen || !!editingIssue}
        title={editingIssue ? dr.editIssue : dr.addIssue}
        onClose={() => { setIsIssueOpen(false); setEditingIssue(null); }}
        size="lg"
      >
        <form
          onSubmit={issueForm.handleSubmit((d) =>
            editingIssue
              ? updateIssueMutation.mutate({ id: editingIssue.id, data: d })
              : createIssueMutation.mutate(d),
          )}
          className="space-y-4 max-h-[70vh] overflow-y-auto pe-1"
          dir={dir}
        >
          {isSuperAdmin && !editingIssue && (
            <div>
              <label className={labelCls}>{t.visitors.branch}</label>
              <select {...issueForm.register('branchId', { required: true })} className={selectCls}>
                {(branches || []).map((b: any) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t.common.date}</label>
              <input type="date" {...issueForm.register('date', { required: true })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{dr.department}</label>
              <select {...issueForm.register('department', { required: true })} className={selectCls}>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{deptLabel(d)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{dr.issueType}</label>
              <select {...issueForm.register('issueType', { required: true })} className={selectCls}>
                {ISSUE_TYPES.map((tp) => (
                  <option key={tp} value={tp}>{typeLabel(tp)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>{dr.personInvolved}</label>
              <input {...issueForm.register('personInvolved')} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>{t.common.description}</label>
            <textarea {...issueForm.register('description', { required: true })} rows={3} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{dr.severity}</label>
              <select {...issueForm.register('severity')} className={selectCls}>
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>{sevLabel(s)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>{t.common.status}</label>
              <select {...issueForm.register('status')} className={selectCls}>
                {ISSUE_STATUSES.map((s) => (
                  <option key={s} value={s}>{issueStatusLabel(s)}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>{dr.actionTaken}</label>
            <input {...issueForm.register('actionTaken')} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{dr.needsFollowUp}</label>
              <select {...issueForm.register('needsFollowUp')} className={selectCls}>
                <option value="false">{t.visitors.tourNo}</option>
                <option value="true">{t.visitors.tourYes}</option>
              </select>
            </div>
            {issueForm.watch('needsFollowUp') === 'true' && (
              <div>
                <label className={labelCls}>{dr.followUpDate}</label>
                <input type="date" {...issueForm.register('followUpDate')} className={inputCls} />
              </div>
            )}
          </div>
          <div>
            <label className={labelCls}>{t.common.notes}</label>
            <input {...issueForm.register('notes')} className={inputCls} />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => { setIsIssueOpen(false); setEditingIssue(null); }}
              className="px-4 py-2.5 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm font-medium">
              {t.visitors.cancelBtn}
            </button>
            <button type="submit" disabled={createIssueMutation.isPending || updateIssueMutation.isPending}
              className="px-5 py-2.5 text-white rounded-xl hover:opacity-90 transition text-sm font-semibold disabled:opacity-50"
              style={gradient}>
              {createIssueMutation.isPending || updateIssueMutation.isPending
                ? t.visitors.saving
                : editingIssue ? t.visitors.saveBtn : dr.addIssueBtn}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
