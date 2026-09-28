import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { inspectionService, locationService } from '../services';
import { InspectionResultBadge, ConditionBadge } from '../components/Badges';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import { LoadingState, EmptyState, ErrorState, PageHeader, Card, Btn, FormField, Input, Select, Textarea } from '../components/UI';
import { useAuth } from '../context/AuthContext';

export default function Inspections() {
    const { hasRole } = useAuth();
    const [sp] = useSearchParams();
    const [records, setRecords] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [saving, setSaving] = useState(false);
    const [params, setParams] = useState({ result: '', page: 1, limit: 20, asset_id: sp.get('asset_id') || '' });
    const [form, setForm] = useState({
        asset_id: sp.get('asset_id') || '', inspection_date: new Date().toISOString().split('T')[0],
        result: 'PASS', condition: 'GOOD', findings: '', recommendations: '', next_inspection_date: '', remarks: ''
    });

    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const res = await inspectionService.getAll(params);
            setRecords(res.data.data.inspections);
            setPagination(res.data.data.pagination);
        } catch { setError('Failed to load inspections'); }
        finally { setLoading(false); }
    }, [params]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => { if (sp.get('focus') === 'create') setShowCreate(true); }, []);

    const handleCreate = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            await inspectionService.create(form);
            setShowCreate(false); load();
        } catch (err) { alert(err.response?.data?.message || 'Failed'); }
        finally { setSaving(false); }
    };

    const fmt = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    return (
        <div className="space-y-4">
            <PageHeader title="Inspections" subtitle={`${pagination?.total ?? '...'} records`}>
                {hasRole('ADMIN', 'DEPOT_MANAGER', 'TECHNICIAN') && (
                    <Btn size="sm" onClick={() => setShowCreate(true)}><Plus size={14} /> Add Inspection</Btn>
                )}
            </PageHeader>

            <Card className="p-4 flex gap-3">
                <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" value={params.result} onChange={e => setParams(p => ({ ...p, result: e.target.value, page: 1 }))}>
                    <option value="">All Results</option>
                    {['PASS', 'FAIL', 'REQUIRES_ATTENTION'].map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                </select>
            </Card>

            <Card>
                {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={load} /> : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>{['Asset', 'Date', 'Result', 'Condition', 'Inspector', 'Findings', 'Next Inspection'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                    ))}</tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {records.length === 0 ? (
                                        <tr><td colSpan={7}><EmptyState title="No inspection records" /></td></tr>
                                    ) : records.map(r => (
                                        <tr key={r.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <div className="font-mono text-xs font-semibold text-blue-600">{r.asset_code}</div>
                                                <div className="text-xs text-slate-400">{r.asset_name}</div>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{fmt(r.inspection_date)}</td>
                                            <td className="px-4 py-3"><InspectionResultBadge result={r.result} /></td>
                                            <td className="px-4 py-3"><ConditionBadge condition={r.condition} /></td>
                                            <td className="px-4 py-3 text-xs text-slate-500">{r.inspector_name || '—'}</td>
                                            <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate">{r.findings || '—'}</td>
                                            <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{fmt(r.next_inspection_date)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination pagination={pagination} onPageChange={p => setParams(prev => ({ ...prev, page: p }))} />
                    </>
                )}
            </Card>

            <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Record Inspection" size="md">
                <form onSubmit={handleCreate} className="space-y-4">
                    <FormField label="Asset ID" required>
                        <Input type="number" value={form.asset_id} onChange={e => setForm(p => ({ ...p, asset_id: e.target.value }))} required />
                    </FormField>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Inspection Date" required>
                            <Input type="date" value={form.inspection_date} onChange={e => setForm(p => ({ ...p, inspection_date: e.target.value }))} required />
                        </FormField>
                        <FormField label="Next Inspection Date">
                            <Input type="date" value={form.next_inspection_date} onChange={e => setForm(p => ({ ...p, next_inspection_date: e.target.value }))} />
                        </FormField>
                        <FormField label="Result" required>
                            <Select value={form.result} onChange={e => setForm(p => ({ ...p, result: e.target.value }))}>
                                {['PASS', 'FAIL', 'REQUIRES_ATTENTION'].map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                            </Select>
                        </FormField>
                        <FormField label="Condition">
                            <Select value={form.condition} onChange={e => setForm(p => ({ ...p, condition: e.target.value }))}>
                                {['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL'].map(c => <option key={c} value={c}>{c}</option>)}
                            </Select>
                        </FormField>
                    </div>
                    <FormField label="Findings">
                        <Textarea rows={2} value={form.findings} onChange={e => setForm(p => ({ ...p, findings: e.target.value }))} />
                    </FormField>
                    <FormField label="Recommendations">
                        <Textarea rows={2} value={form.recommendations} onChange={e => setForm(p => ({ ...p, recommendations: e.target.value }))} />
                    </FormField>
                    <div className="flex gap-3 justify-end">
                        <Btn variant="secondary" type="button" onClick={() => setShowCreate(false)}>Cancel</Btn>
                        <Btn type="submit" disabled={saving}>{saving ? 'Saving…' : 'Record Inspection'}</Btn>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
