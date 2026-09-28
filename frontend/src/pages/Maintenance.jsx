import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { maintenanceService, assetService, userService } from '../services';
import { PriorityBadge, MaintenanceStatusBadge } from '../components/Badges';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import { LoadingState, EmptyState, ErrorState, PageHeader, Card, Btn, FormField, Input, Select, Textarea } from '../components/UI';
import { useAuth } from '../context/AuthContext';

export default function Maintenance() {
    const { hasRole, user } = useAuth();
    const navigate = useNavigate();
    const [sp] = useSearchParams();
    const [records, setRecords] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [assets, setAssets] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [showUpdate, setShowUpdate] = useState(null);
    const [saving, setSaving] = useState(false);
    const [params, setParams] = useState({ status: '', priority: '', page: 1, limit: 20, asset_id: sp.get('asset_id') || '' });
    const [form, setForm] = useState({ asset_id: sp.get('asset_id') || '', title: '', description: '', priority: 'MEDIUM', scheduled_at: '' });
    const [updateForm, setUpdateForm] = useState({});

    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const res = await maintenanceService.getAll(params);
            setRecords(res.data.data.maintenance);
            setPagination(res.data.data.pagination);
        } catch { setError('Failed to load maintenance records'); }
        finally { setLoading(false); }
    }, [params]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => {
        userService.getAll().then(r => setTechnicians(r.data.data.users.filter(u => u.role === 'TECHNICIAN'))).catch(() => { });
    }, []);

    useEffect(() => {
        if (sp.get('focus') === 'create') setShowCreate(true);
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            await maintenanceService.create(form);
            setShowCreate(false); setForm({ asset_id: '', title: '', description: '', priority: 'MEDIUM', scheduled_at: '' });
            load();
        } catch (err) { alert(err.response?.data?.message || 'Failed to create'); }
        finally { setSaving(false); }
    };

    const handleUpdate = async (e, id) => {
        e.preventDefault(); setSaving(true);
        try {
            await maintenanceService.update(id, updateForm);
            setShowUpdate(null); load();
        } catch (err) { alert(err.response?.data?.message || 'Failed to update'); }
        finally { setSaving(false); }
    };

    const fmt = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    return (
        <div className="space-y-4">
            <PageHeader title="Maintenance Management" subtitle={`${pagination?.total ?? '...'} requests`}>
                {hasRole('ADMIN', 'DEPOT_MANAGER', 'TECHNICIAN') && (
                    <Btn size="sm" onClick={() => setShowCreate(true)}><Plus size={14} /> Report Issue</Btn>
                )}
            </PageHeader>

            <Card className="p-4 flex gap-3 flex-wrap">
                <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" value={params.status} onChange={e => setParams(p => ({ ...p, status: e.target.value, page: 1 }))}>
                    <option value="">All Statuses</option>
                    {['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
                <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" value={params.priority} onChange={e => setParams(p => ({ ...p, priority: e.target.value, page: 1 }))}>
                    <option value="">All Priorities</option>
                    {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </Card>

            <Card>
                {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={load} /> : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>{['Asset', 'Issue', 'Priority', 'Status', 'Technician', 'Reported', 'Cost', 'Actions'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                    ))}</tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {records.length === 0 ? (
                                        <tr><td colSpan={8}><EmptyState title="No maintenance records" /></td></tr>
                                    ) : records.map(r => (
                                        <tr key={r.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <button onClick={() => navigate(`/assets/${r.asset_id}`)} className="font-mono text-xs font-semibold text-blue-600 hover:underline">{r.asset_code}</button>
                                                <div className="text-xs text-slate-400">{r.asset_name}</div>
                                            </td>
                                            <td className="px-4 py-3 max-w-xs">
                                                <div className="font-medium text-slate-800 truncate">{r.title}</div>
                                                {r.diagnosis && <div className="text-xs text-slate-400 truncate">{r.diagnosis}</div>}
                                            </td>
                                            <td className="px-4 py-3"><PriorityBadge priority={r.priority} /></td>
                                            <td className="px-4 py-3"><MaintenanceStatusBadge status={r.status} /></td>
                                            <td className="px-4 py-3 text-xs text-slate-500">{r.technician_name || '—'}</td>
                                            <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{fmt(r.reported_at)}</td>
                                            <td className="px-4 py-3 text-xs text-slate-500">{r.maintenance_cost ? `₹${Number(r.maintenance_cost).toLocaleString()}` : '—'}</td>
                                            <td className="px-4 py-3">
                                                {r.status !== 'COMPLETED' && r.status !== 'CANCELLED' && (
                                                    <Btn size="sm" variant="secondary" onClick={() => { setShowUpdate(r); setUpdateForm({ status: r.status, assigned_technician: r.assigned_technician || '', diagnosis: r.diagnosis || '', resolution: r.resolution || '', maintenance_cost: r.maintenance_cost || '', parts_used: r.parts_used || '', remarks: r.remarks || '' }); }}>
                                                        Update
                                                    </Btn>
                                                )}
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

            {/* Create Modal */}
            <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Report Maintenance Issue" size="md">
                <form onSubmit={handleCreate} className="space-y-4">
                    <FormField label="Asset ID" required>
                        <Input value={form.asset_id} onChange={e => setForm(p => ({ ...p, asset_id: e.target.value }))} placeholder="Enter asset ID number" required type="number" />
                    </FormField>
                    <FormField label="Issue Title" required>
                        <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Brief title of the issue" required />
                    </FormField>
                    <FormField label="Description">
                        <Textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Detailed description…" />
                    </FormField>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Priority">
                            <Select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => <option key={p} value={p}>{p}</option>)}
                            </Select>
                        </FormField>
                        <FormField label="Scheduled Date">
                            <Input type="datetime-local" value={form.scheduled_at} onChange={e => setForm(p => ({ ...p, scheduled_at: e.target.value }))} />
                        </FormField>
                    </div>
                    <div className="flex gap-3 justify-end">
                        <Btn variant="secondary" type="button" onClick={() => setShowCreate(false)}>Cancel</Btn>
                        <Btn type="submit" disabled={saving}>{saving ? 'Saving…' : 'Create Request'}</Btn>
                    </div>
                </form>
            </Modal>

            {/* Update Modal */}
            {showUpdate && (
                <Modal isOpen={!!showUpdate} onClose={() => setShowUpdate(null)} title={`Update: ${showUpdate.title}`} size="lg">
                    <form onSubmit={e => handleUpdate(e, showUpdate.id)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField label="Status">
                                <Select value={updateForm.status} onChange={e => setUpdateForm(p => ({ ...p, status: e.target.value }))}>
                                    {['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(s => (
                                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                                    ))}
                                </Select>
                            </FormField>
                            <FormField label="Assign Technician">
                                <Select value={updateForm.assigned_technician} onChange={e => setUpdateForm(p => ({ ...p, assigned_technician: e.target.value }))}>
                                    <option value="">No technician</option>
                                    {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </Select>
                            </FormField>
                        </div>
                        <FormField label="Diagnosis">
                            <Textarea rows={2} value={updateForm.diagnosis} onChange={e => setUpdateForm(p => ({ ...p, diagnosis: e.target.value }))} placeholder="Technical diagnosis…" />
                        </FormField>
                        <FormField label="Resolution">
                            <Textarea rows={2} value={updateForm.resolution} onChange={e => setUpdateForm(p => ({ ...p, resolution: e.target.value }))} placeholder="Repair resolution…" />
                        </FormField>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField label="Cost (₹)">
                                <Input type="number" value={updateForm.maintenance_cost} onChange={e => setUpdateForm(p => ({ ...p, maintenance_cost: e.target.value }))} min="0" />
                            </FormField>
                            <FormField label="Parts Used">
                                <Input value={updateForm.parts_used} onChange={e => setUpdateForm(p => ({ ...p, parts_used: e.target.value }))} placeholder="Comma separated" />
                            </FormField>
                        </div>
                        <FormField label="Remarks">
                            <Input value={updateForm.remarks} onChange={e => setUpdateForm(p => ({ ...p, remarks: e.target.value }))} />
                        </FormField>
                        <div className="flex gap-3 justify-end">
                            <Btn variant="secondary" type="button" onClick={() => setShowUpdate(null)}>Cancel</Btn>
                            <Btn type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Update'}</Btn>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
