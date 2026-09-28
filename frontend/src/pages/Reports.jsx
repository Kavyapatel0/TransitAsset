import React, { useState, useEffect } from 'react';
import { reportService } from '../services';
import { LoadingState, EmptyState, ErrorState, PageHeader, Card, Btn, FormField, Select, Input } from '../components/UI';
import { Download, FileText, BarChart3 } from 'lucide-react';

const REPORT_TYPES = [
    { value: 'inventory', label: 'Asset Inventory', desc: 'Full asset list with status and location' },
    { value: 'maintenance', label: 'Maintenance Report', desc: 'Maintenance requests and costs' },
    { value: 'inspection', label: 'Inspection Report', desc: 'All inspection records and results' },
    { value: 'transfer', label: 'Transfer Report', desc: 'Asset transfer history' },
    { value: 'warranty', label: 'Warranty Report', desc: 'Warranty status and expiry dates' },
    { value: 'retired', label: 'Retired Assets', desc: 'Decommissioned asset list' },
];

export default function Reports() {
    const [type, setType] = useState('inventory');
    const [status, setStatus] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const generate = async () => {
        setLoading(true); setError('');
        try {
            const res = await reportService.getReport({ type, status, from_date: fromDate, to_date: toDate });
            setReport(res.data.data.report);
        } catch { setError('Failed to generate report'); }
        finally { setLoading(false); }
    };

    const exportCSV = () => {
        if (!report?.data?.length) return;
        const headers = Object.keys(report.data[0]);
        const rows = report.data.map(row => headers.map(h => `"${(row[h] ?? '').toString().replace(/"/g, '""')}"`).join(','));
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `transitasset_${type}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click(); URL.revokeObjectURL(url);
    };

    const fmt = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    return (
        <div className="space-y-4">
            <PageHeader title="Reports & Export" subtitle="Generate and download operational reports" />

            {/* Report type cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {REPORT_TYPES.map(r => (
                    <button
                        key={r.value}
                        onClick={() => setType(r.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-colors ${type === r.value ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    >
                        <div className={`text-sm font-semibold ${type === r.value ? 'text-blue-700' : 'text-slate-700'}`}>{r.label}</div>
                        <div className="text-xs text-slate-400 mt-1">{r.desc}</div>
                    </button>
                ))}
            </div>

            {/* Filters + generate */}
            <Card className="p-4 flex flex-wrap gap-3 items-end">
                {['maintenance', 'inspection', 'transfer'].includes(type) && (
                    <>
                        <FormField label="From Date"><Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-36" /></FormField>
                        <FormField label="To Date"><Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-36" /></FormField>
                    </>
                )}
                {['inventory', 'maintenance'].includes(type) && (
                    <FormField label="Status">
                        <Select value={status} onChange={e => setStatus(e.target.value)} className="w-36">
                            <option value="">All</option>
                            {type === 'inventory' ? ['OPERATIONAL', 'UNDER_MAINTENANCE', 'RETIRED'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)
                                : ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                        </Select>
                    </FormField>
                )}
                <Btn onClick={generate} disabled={loading}><BarChart3 size={14} />{loading ? 'Generating…' : 'Generate Report'}</Btn>
                {report?.data?.length > 0 && (
                    <Btn variant="secondary" onClick={exportCSV}><Download size={14} /> Export CSV</Btn>
                )}
            </Card>

            {/* Results */}
            {error && <ErrorState message={error} onRetry={generate} />}
            {report && (
                <Card>
                    <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileText size={16} className="text-blue-500" />
                            <span className="text-sm font-semibold text-slate-700">{REPORT_TYPES.find(t => t.value === report.type)?.label}</span>
                            <span className="text-xs text-slate-400">({report.count} records)</span>
                        </div>
                    </div>
                    {report.data.length === 0 ? <EmptyState title="No data for selected criteria" /> : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        {Object.keys(report.data[0]).map(h => (
                                            <th key={h} className="text-left px-3 py-2 font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                                                {h.replace(/_/g, ' ')}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {report.data.map((row, i) => (
                                        <tr key={i} className="hover:bg-slate-50">
                                            {Object.values(row).map((val, j) => (
                                                <td key={j} className="px-3 py-2 text-slate-600 whitespace-nowrap">
                                                    {typeof val === 'number' && Object.keys(row)[j].includes('cost') ? `₹${Number(val).toLocaleString('en-IN')}`
                                                        : val?.toString().includes('T') && val?.length > 10 ? fmt(val)
                                                            : val ?? '—'}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
}
