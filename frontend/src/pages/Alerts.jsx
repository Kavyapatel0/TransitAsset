import React, { useState, useEffect, useCallback } from 'react';
import { alertService } from '../services';
import { SeverityBadge } from '../components/Badges';
import Pagination from '../components/Pagination';
import { LoadingState, EmptyState, ErrorState, PageHeader, Card, Btn } from '../components/UI';
import { CheckCheck, Bell } from 'lucide-react';

export default function Alerts() {
    const [alerts, setAlerts] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [params, setParams] = useState({ is_read: '', severity: '', page: 1, limit: 30 });

    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const res = await alertService.getAll(params);
            setAlerts(res.data.data.alerts);
            setPagination(res.data.data.pagination);
        } catch { setError('Failed to load alerts'); }
        finally { setLoading(false); }
    }, [params]);

    useEffect(() => { load(); }, [load]);

    const markRead = async (id) => {
        await alertService.markRead(id);
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: 1 } : a));
    };

    const markAllRead = async () => {
        await alertService.markAllRead();
        load();
    };

    const SEVERITY_BG = { INFO: 'border-l-blue-400', WARNING: 'border-l-yellow-400', HIGH: 'border-l-orange-500', CRITICAL: 'border-l-red-500' };
    const fmt = d => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

    return (
        <div className="space-y-4">
            <PageHeader title="Alerts & Notifications" subtitle={`${pagination?.total ?? '...'} alerts`}>
                <Btn variant="secondary" size="sm" onClick={markAllRead}><CheckCheck size={14} /> Mark All Read</Btn>
            </PageHeader>

            <Card className="p-4 flex gap-3 flex-wrap">
                <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" value={params.is_read} onChange={e => setParams(p => ({ ...p, is_read: e.target.value, page: 1 }))}>
                    <option value="">All</option>
                    <option value="0">Unread</option>
                    <option value="1">Read</option>
                </select>
                <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" value={params.severity} onChange={e => setParams(p => ({ ...p, severity: e.target.value, page: 1 }))}>
                    <option value="">All Severities</option>
                    {['CRITICAL', 'HIGH', 'WARNING', 'INFO'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </Card>

            <Card>
                {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={load} /> : (
                    <>
                        {alerts.length === 0 ? <EmptyState title="No alerts" description="You're all caught up!" /> : (
                            <div className="divide-y divide-slate-100">
                                {alerts.map(alert => (
                                    <div key={alert.id} className={`flex items-start gap-4 px-5 py-4 border-l-4 ${SEVERITY_BG[alert.severity] || 'border-l-slate-300'} ${alert.is_read ? 'opacity-60 bg-slate-50/50' : 'bg-white hover:bg-slate-50'} transition-colors`}>
                                        <Bell size={16} className={`mt-0.5 flex-shrink-0 ${alert.is_read ? 'text-slate-300' : 'text-orange-500'}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <SeverityBadge severity={alert.severity} />
                                                <span className="text-xs text-slate-400">{alert.alert_type?.replace(/_/g, ' ')}</span>
                                                {!alert.is_read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                                            </div>
                                            <p className="text-sm font-medium text-slate-800 mt-1">{alert.title}</p>
                                            {alert.message && <p className="text-xs text-slate-500 mt-0.5">{alert.message}</p>}
                                            {alert.asset_code && <p className="text-xs text-blue-600 mt-1">Asset: {alert.asset_code} — {alert.asset_name}</p>}
                                            <p className="text-xs text-slate-400 mt-1">{fmt(alert.created_at)}</p>
                                        </div>
                                        {!alert.is_read && (
                                            <button onClick={() => markRead(alert.id)} className="text-xs text-blue-600 hover:underline flex-shrink-0">Mark Read</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        <Pagination pagination={pagination} onPageChange={p => setParams(prev => ({ ...prev, page: p }))} />
                    </>
                )}
            </Card>
        </div>
    );
}
