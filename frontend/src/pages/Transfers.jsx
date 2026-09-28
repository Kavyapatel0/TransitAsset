import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, CheckCircle, XCircle, Truck } from 'lucide-react';
import { transferService, locationService } from '../services';
import { TransferStatusBadge } from '../components/Badges';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import { LoadingState, EmptyState, ErrorState, PageHeader, Card, Btn, FormField, Input, Select, Textarea } from '../components/UI';
import { useAuth } from '../context/AuthContext';

export default function Transfers() {
    const { hasRole } = useAuth();
    const [sp] = useSearchParams();
    const [records, setRecords] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [locations, setLocations] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [saving, setSaving] = useState(false);
    const [params, setParams] = useState({ status: '', page: 1, limit: 20 });
    const [form, setForm] = useState({ asset_id: sp.get('asset_id') || '', to_location_id: '', reason: '', remarks: '' });

    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const res = await transferService.getAll(params);
            setRecords(res.data.data.transfers);
            setPagination(res.data.data.pagination);
        } catch { setError('Failed to load transfers'); }
        finally { setLoading(false); }
    }, [params]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => {
        locationService.getAll().then(r => setLocations(r.data.data.locations)).catch(() => { });
        if (sp.get('focus') === 'create') setShowCreate(true);
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            await transferService.create(form);
            setShowCreate(false); setForm({ asset_id: '', to_location_id: '', reason: '', remarks: '' }); load();
        } catch (err) { alert(err.response?.data?.message || 'Failed'); }
        finally { setSaving(false); }
    };

    const updateStatus = async (id, status) => {
        try { await transferService.update(id, { status }); load(); }
        catch (err) { alert(err.response?.data?.message || 'Failed'); }
    };

    const fmt = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    return (
        <div className="space-y-4">
            <PageHeader title="Asset Transfers" subtitle={`${pagination?.total ?? '...'} transfer records`}>
                {hasRole('ADMIN', 'DEPOT_MANAGER') && (
                    <Btn size="sm" onClick={() => setShowCreate(true)}><Plus size={14} /> Request Transfer</Btn>
                )}
            </PageHeader>

            <Card className="p-4 flex gap-3">
                <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" value={params.status} onChange={e => setParams(p => ({ ...p, status: e.target.value, page: 1 }))}>
                    <option value="">All Statuses</option>
                    {['REQUESTED', 'APPROVED', 'IN_TRANSIT', 'COMPLETED', 'REJECTED'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
            </Card>

            <Card>
                {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={load} /> : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>{['Asset', 'From → To', 'Reason', 'Status', 'Requested By', 'Date', 'Actions'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                    ))}</tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {records.length === 0 ? (
                                        <tr><td colSpan={7}><EmptyState title="No transfer records" /></td></tr>
                                    ) : records.map(r => (
                                        <tr key={r.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <div className="font-mono text-xs font-semibold text-blue-600">{r.asset_code}</div>
                                                <div className="text-xs text-slate-400">{r.asset_name}</div>
                                            </td>
                                            <td className="px-4 py-3 text-xs">
                                                <span className="text-slate-500">{r.from_location_name || 'N/A'}</span>
                                                <span className="mx-1 text-slate-400">→</span>
                                                <span className="font-medium text-slate-700">{r.to_location_name}</span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate">{r.reason}</td>
                                            <td className="px-4 py-3"><TransferStatusBadge status={r.status} /></td>
                                            <td className="px-4 py-3 text-xs text-slate-500">{r.requested_by_name}</td>
                                            <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{fmt(r.created_at)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1">
                                                    {hasRole('ADMIN') && r.status === 'REQUESTED' && (
                                                        <>
                                                            <button onClick={() => updateStatus(r.id, 'APPROVED')} className="p-1.5 rounded hover:bg-green-50 text-green-600" title="Approve"><CheckCircle size={14} /></button>
                                                            <button onClick={() => updateStatus(r.id, 'REJECTED')} className="p-1.5 rounded hover:bg-red-50 text-red-600" title="Reject"><XCircle size={14} /></button>
                                                        </>
                                                    )}
                                                    {r.status === 'APPROVED' && (
                                                        <button onClick={() => updateStatus(r.id, 'IN_TRANSIT')} className="p-1.5 rounded hover:bg-blue-50 text-blue-600" title="In Transit"><Truck size={14} /></button>
                                                    )}
                                                    {r.status === 'IN_TRANSIT' && (
                                                        <button onClick={() => updateStatus(r.id, 'COMPLETED')} className="p-1.5 rounded hover:bg-emerald-50 text-emerald-600" title="Complete"><CheckCircle size={14} /></button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination pagination={pagination} onPageChange={p => setParams(prev => ({ ...prev, page: p }))} />
                    </>
                )}
            </Card>

            <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Request Asset Transfer">
                <form onSubmit={handleCreate} className="space-y-4">
                    <FormField label="Asset ID" required>
                        <Input type="number" value={form.asset_id} onChange={e => setForm(p => ({ ...p, asset_id: e.target.value }))} required />
                    </FormField>
                    <FormField label="Destination Location" required>
                        <Select value={form.to_location_id} onChange={e => setForm(p => ({ ...p, to_location_id: e.target.value }))} required>
                            <option value="">Select location…</option>
                            {locations.map(l => <option key={l.id} value={l.id}>{l.name} ({l.type})</option>)}
                        </Select>
                    </FormField>
                    <FormField label="Reason" required>
                        <Textarea rows={2} value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="Reason for transfer…" required />
                    </FormField>
                    <FormField label="Remarks">
                        <Input value={form.remarks} onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))} />
                    </FormField>
                    <div className="flex gap-3 justify-end">
                        <Btn variant="secondary" type="button" onClick={() => setShowCreate(false)}>Cancel</Btn>
                        <Btn type="submit" disabled={saving}>{saving ? 'Submitting…' : 'Submit Request'}</Btn>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
