import React, { useState, useEffect, useCallback } from 'react';
import { auditService } from '../services';
import Pagination from '../components/Pagination';
import { LoadingState, EmptyState, ErrorState, PageHeader, Card, Input } from '../components/UI';

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [params, setParams] = useState({ entity_type: '', action: '', page: 1, limit: 30 });

    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const res = await auditService.getAll(params);
            setLogs(res.data.data.logs);
            setPagination(res.data.data.pagination);
        } catch { setError('Failed to load audit logs'); }
        finally { setLoading(false); }
    }, [params]);

    useEffect(() => { load(); }, [load]);

    const ACTION_COLORS = {
        CREATED: 'bg-green-50 text-green-700', UPDATED: 'bg-blue-50 text-blue-700',
        DELETED: 'bg-red-50 text-red-700', LOGIN: 'bg-slate-100 text-slate-600',
        STATUS_CHANGED: 'bg-purple-50 text-purple-700', COMPLETED: 'bg-emerald-50 text-emerald-700',
    };
    const actionColor = (action) => {
        const key = Object.keys(ACTION_COLORS).find(k => action?.includes(k));
        return ACTION_COLORS[key] || 'bg-slate-100 text-slate-600';
    };

    const fmt = d => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

    return (
        <div className="space-y-4">
            <PageHeader title="Audit Log" subtitle="Complete system audit trail" />

            <Card className="p-4 flex gap-3 flex-wrap">
                <Input className="w-auto" placeholder="Filter by action…" value={params.action} onChange={e => setParams(p => ({ ...p, action: e.target.value, page: 1 }))} />
                <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" value={params.entity_type} onChange={e => setParams(p => ({ ...p, entity_type: e.target.value, page: 1 }))}>
                    <option value="">All Entities</option>
                    {['assets', 'maintenance_requests', 'inspections', 'asset_transfers', 'users', 'auth', 'locations'].map(e => <option key={e} value={e}>{e.replace(/_/g, ' ')}</option>)}
                </select>
            </Card>

            <Card>
                {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={load} /> : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>{['Timestamp', 'User', 'Action', 'Entity', 'Entity ID', 'IP Address'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                    ))}</tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {logs.length === 0 ? <tr><td colSpan={6}><EmptyState title="No audit logs found" /></td></tr> : logs.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{fmt(log.created_at)}</td>
                                            <td className="px-4 py-3">
                                                <div className="text-xs font-medium text-slate-700">{log.user_name || '—'}</div>
                                                <div className="text-xs text-slate-400">{log.user_email}</div>
                                            </td>
                                            <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded font-medium ${actionColor(log.action)}`}>{log.action?.replace(/_/g, ' ')}</span></td>
                                            <td className="px-4 py-3 text-xs text-slate-600">{log.entity_type || '—'}</td>
                                            <td className="px-4 py-3 text-xs font-mono text-slate-500">{log.entity_id || '—'}</td>
                                            <td className="px-4 py-3 text-xs font-mono text-slate-400">{log.ip_address || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination pagination={pagination} onPageChange={p => setParams(prev => ({ ...prev, page: p }))} />
                    </>
                )}
            </Card>
        </div>
    );
}
