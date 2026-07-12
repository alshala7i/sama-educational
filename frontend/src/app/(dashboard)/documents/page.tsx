'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, FileCheck2, AlertTriangle, Eye, Pencil, Trash2, CalendarClock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';

interface DocumentForm {
  branchId: string;
  name: string;
  type: 'LICENSE' | 'CONTRACT';
  expiryDate: string;
  notes?: string;
}

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const { t, dir } = useLanguage();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState(false);
  const [branchFilter, setBranchFilter] = useState('');

  const addForm = useForm<DocumentForm>();
  const editForm = useForm<DocumentForm>();

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => (await api.get('/branches')).data,
    enabled: isSuperAdmin,
  });

  const { data: documents, isLoading } = useQuery({
    queryKey: ['branch-documents', branchFilter],
    queryFn: async () => {
      const params = branchFilter ? { branchId: branchFilter } : {};
      return (await api.get('/branch-documents', { params })).data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) =>
      api.post('/branch-documents', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branch-documents'] });
      setIsAddOpen(false);
      setFile(null);
      addForm.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DocumentForm> }) =>
      api.patch(`/branch-documents/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branch-documents'] });
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/branch-documents/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['branch-documents'] }),
  });

  const onAdd = (data: DocumentForm) => {
    if (!file) {
      setFileError(true);
      return;
    }
    setFileError(false);
    const formData = new FormData();
    formData.append('branchId', isSuperAdmin ? data.branchId : user?.branchId || '');
    formData.append('name', data.name);
    formData.append('type', data.type);
    formData.append('expiryDate', data.expiryDate);
    if (data.notes) formData.append('notes', data.notes);
    formData.append('file', file);
    createMutation.mutate(formData);
  };

  const onEdit = (data: DocumentForm) => {
    if (!editing) return;
    updateMutation.mutate({
      id: editing.id,
      data: { name: data.name, type: data.type, expiryDate: data.expiryDate, notes: data.notes },
    });
  };

  const openEdit = (doc: any) => {
    setEditing(doc);
    editForm.reset({
      name: doc.name,
      type: doc.type,
      expiryDate: new Date(doc.expiryDate).toISOString().slice(0, 10),
      notes: doc.notes || '',
    });
  };

  const viewFile = async (doc: any) => {
    const res = await api.get(`/branch-documents/${doc.id}/file`, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([res.data], { type: doc.mimeType }));
    window.open(url, '_blank');
  };

  if (isLoading) return <LoadingSpinner />;

  const docs = documents || [];
  const alertCount = docs.filter(
    (d: any) => d.expiryStatus === 'EXPIRED' || d.expiryStatus === 'EXPIRING_SOON',
  ).length;

  const statusBadge = (doc: any) => {
    if (doc.expiryStatus === 'EXPIRED')
      return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700">{t.documents.expired}</span>;
    if (doc.expiryStatus === 'EXPIRING_SOON')
      return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">{t.documents.expiringSoon}</span>;
    return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">{t.documents.valid}</span>;
  };

  const inputCls =
    'w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm';

  const DocumentFormFields = ({ form, isEdit }: { form: any; isEdit: boolean }) => (
    <>
      {isSuperAdmin && !isEdit && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.documents.branch}</label>
          <select {...form.register('branchId', { required: true })} className={`${inputCls} bg-white`}>
            {(branches || []).map((b: any) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">{t.documents.name}</label>
        <input {...form.register('name', { required: true })} placeholder={t.documents.namePlaceholder} className={inputCls} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.documents.typeLabel}</label>
          <select {...form.register('type', { required: true })} className={`${inputCls} bg-white`}>
            <option value="LICENSE">{t.documents.license}</option>
            <option value="CONTRACT">{t.documents.contract}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.documents.expiryDate}</label>
          <input type="date" {...form.register('expiryDate', { required: true })} className={inputCls} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">{t.documents.notes}</label>
        <textarea {...form.register('notes')} rows={2} placeholder={t.documents.notesPlaceholder} className={inputCls} />
      </div>
    </>
  );

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{t.documents.title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t.documents.subtitle}</p>
        </div>
        <button
          onClick={() => { setIsAddOpen(true); setFile(null); setFileError(false); addForm.reset({ type: 'LICENSE' }); }}
          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:opacity-90 transition"
          style={{ background: 'linear-gradient(135deg, #0f4c75, #1b6ca8)' }}
        >
          <Plus size={18} />
          {t.documents.addDocument}
        </button>
      </div>

      {/* Expiry alert banner */}
      {alertCount > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <AlertTriangle size={20} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-amber-800">
            {t.documents.expiringAlert.replace('{count}', String(alertCount))}
          </p>
        </div>
      )}

      {/* Branch filter (super admin only) */}
      {isSuperAdmin && (
        <select
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{t.documents.allBranches}</option>
          {(branches || []).map((b: any) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      )}

      {/* Documents table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        {docs.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            <FileCheck2 size={32} className="mx-auto mb-2 opacity-40" />
            {t.documents.noDocuments}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-xs">
                <th className="px-4 py-3 text-start font-semibold">{t.documents.name}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.documents.typeLabel}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.documents.branch}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.documents.expiryDate}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.documents.statusLabel}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.documents.notes}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.documents.actions}</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc: any) => (
                <tr key={doc.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-semibold text-gray-900">{doc.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {doc.type === 'LICENSE' ? t.documents.license : t.documents.contract}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{doc.branch?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <CalendarClock size={14} className="text-gray-400" />
                      {new Date(doc.expiryDate).toLocaleDateString()}
                    </div>
                    <p className={`text-xs mt-0.5 ${doc.expiryStatus === 'EXPIRED' ? 'text-red-500' : doc.expiryStatus === 'EXPIRING_SOON' ? 'text-amber-600' : 'text-gray-400'}`}>
                      {doc.daysRemaining >= 0
                        ? t.documents.daysLeft.replace('{count}', String(doc.daysRemaining))
                        : t.documents.expiredSince.replace('{count}', String(Math.abs(doc.daysRemaining)))}
                    </p>
                  </td>
                  <td className="px-4 py-3">{statusBadge(doc)}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">{doc.notes || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => viewFile(doc)} title={t.documents.viewFile}
                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => openEdit(doc)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition">
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => { if (confirm(t.documents.deleteConfirm)) deleteMutation.mutate(doc.id); }}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add modal */}
      <Modal isOpen={isAddOpen} title={t.documents.addTitle} onClose={() => setIsAddOpen(false)} size="md">
        <form onSubmit={addForm.handleSubmit(onAdd)} className="space-y-4" dir={dir}>
          {DocumentFormFields({ form: addForm, isEdit: false })}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t.documents.file}</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              onChange={(e) => { setFile(e.target.files?.[0] || null); setFileError(false); }}
              className="w-full text-sm text-gray-600 file:me-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:text-sm file:font-semibold hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-400 mt-1">{t.documents.fileHint}</p>
            {fileError && <p className="text-xs text-red-500 mt-1">{t.documents.fileRequired}</p>}
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setIsAddOpen(false)}
              className="px-4 py-2.5 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm font-medium">
              {t.documents.cancelBtn}
            </button>
            <button type="submit" disabled={createMutation.isPending}
              className="px-5 py-2.5 text-white rounded-xl hover:opacity-90 transition text-sm font-semibold disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #0f4c75, #1b6ca8)' }}>
              {createMutation.isPending ? t.documents.saving : t.documents.addBtn}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={!!editing} title={t.documents.editTitle} onClose={() => setEditing(null)} size="md">
        <form onSubmit={editForm.handleSubmit(onEdit)} className="space-y-4" dir={dir}>
          {DocumentFormFields({ form: editForm, isEdit: true })}
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setEditing(null)}
              className="px-4 py-2.5 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm font-medium">
              {t.documents.cancelBtn}
            </button>
            <button type="submit" disabled={updateMutation.isPending}
              className="px-5 py-2.5 text-white rounded-xl hover:opacity-90 transition text-sm font-semibold disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #0f4c75, #1b6ca8)' }}>
              {updateMutation.isPending ? t.documents.saving : t.documents.saveBtn}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
