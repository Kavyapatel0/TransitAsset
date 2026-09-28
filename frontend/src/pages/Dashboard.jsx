import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Package, CheckCircle, Wrench, ClipboardCheck, Archive, AlertTriangle,
    Eye, ShieldAlert, Clock, ArrowRightLeft, TrendingUp, MapPin, Activity
} from 'lucide-react';
import { dashboardService } from '../services';
import { LoadingState, ErrorState, KpiCard, Card } from '../components/UI';
import { StatusBadge } from '../components/Badges';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [charts, setCharts] = useState(null);
    const [activity, setActivity] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const [s, c, a, l] = await Promise.all([
                    dashboardService.getStats(),
                    dashboardService.getCharts(),
                    dashboardService.getActivity(),
                    dashboardService.getLocations(),
                ]);
                setStats(s.data.data.stats);
                setCharts(c.data.data.charts);
                setActivity(a.data.data.activity);
                setLocations(l.data.data.overview);
            } catch { setError('Failed to load dashboard'); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    if (loading) return <LoadingState message="Loading dashboard..." />;
    if (error) return <ErrorState message={error} />;

    const kpiItems = [
        { title: 'Total Assets', value: stats?.totalAssets, icon: Package, color: 'blue', path: '/assets' },
        { title: 'Operational', value: stats?.operational, icon: CheckCircle, color: 'green', path: '/assets?status=OPERATIONAL' },
        { title: 'Under Maintenance', value: stats?.underMaintenance, icon: Wrench, color: 'orange', path: '/maintenance?status=IN_PROGRESS' },
        { title: 'Under Inspection', value: stats?.underInspection, icon: ClipboardCheck, color: 'yellow', path: '/inspections' },
        { title: 'Retired', value: stats?.retired, icon: Archive, color: 'gray', path: '/assets?status=RETIRED' },
        { title: 'Maintenance Due', value: stats?.maintenanceDue, icon: AlertTriangle, color: 'red', path: '/maintenance?status=OPEN' },
        { title: 'Inspection Overdue', value: stats?.inspectionOverdue, icon: Clock, color: 'red', path: '/inspections' },
        { title: 'Warranty Expiring', value: stats?.warrantyExpiring, icon: ShieldAlert, color: 'orange', path: '/assets?warranty=expiring' },
    ];

    const BAR_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

    const renderBar = (data, labelKey, valueKey) => {
        if (!data || data.length === 0) return <div className="text-sm text-slate-400 text-center py-4">No data</div>;
        const max = Math.max(...data.map(d => parseInt(d[valueKey])));
        return (
            <div className="space-y-2">
                {data.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-28 text-xs text-slate-600 truncate flex-shrink-0" title={item[labelKey]}>{item[labelKey]}</div>
                        <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                            <div
                                className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
                                style={{ width: `${max > 0 ? (item[valueKey] / max) * 100 : 0}%`, backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }}
                            >
                                <span className="text-xs text-white font-medium">{item[valueKey]}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold text-slate-800">Operations Dashboard</h1>
                <p className="text-sm text-slate-500">Live view of asset inventory and operational status</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {kpiItems.map(k => (
                    <KpiCard key={k.title} {...k} onClick={() => k.path && navigate(k.path)} />
                ))}
            </div>

            {/* Action Required + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Action Required */}
                <Card>
                    <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-orange-500" />
                        <h2 className="text-sm font-semibold text-slate-800">Action Required</h2>
                    </div>
                    <div className="p-4 space-y-3">
                        {stats?.maintenanceDue > 0 && (
                            <div onClick={() => navigate('/maintenance')} className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200 cursor-pointer hover:bg-amber-100">
                                <Wrench size={16} className="text-amber-600" />
                                <span className="text-sm text-amber-800"><b>{stats.maintenanceDue}</b> maintenance request{stats.maintenanceDue > 1 ? 's' : ''} pending</span>
                            </div>
                        )}
                        {stats?.inspectionOverdue > 0 && (
                            <div onClick={() => navigate('/inspections')} className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200 cursor-pointer hover:bg-red-100">
                                <ClipboardCheck size={16} className="text-red-600" />
                                <span className="text-sm text-red-800"><b>{stats.inspectionOverdue}</b> inspection{stats.inspectionOverdue > 1 ? 's' : ''} overdue</span>
                            </div>
                        )}
                        {stats?.warrantyExpiring > 0 && (
                            <div onClick={() => navigate('/assets?warranty=expiring')} className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200 cursor-pointer hover:bg-orange-100">
                                <ShieldAlert size={16} className="text-orange-600" />
                                <span className="text-sm text-orange-800"><b>{stats.warrantyExpiring}</b> warrant{stats.warrantyExpiring > 1 ? 'ies' : 'y'} expiring soon</span>
                            </div>
                        )}
                        {stats?.pendingTransfers > 0 && (
                            <div onClick={() => navigate('/transfers')} className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200 cursor-pointer hover:bg-blue-100">
                                <ArrowRightLeft size={16} className="text-blue-600" />
                                <span className="text-sm text-blue-800"><b>{stats.pendingTransfers}</b> transfer{stats.pendingTransfers > 1 ? 's' : ''} pending</span>
                            </div>
                        )}
                        {stats?.criticalCondition > 0 && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                                <AlertTriangle size={16} className="text-red-600" />
                                <span className="text-sm text-red-800"><b>{stats.criticalCondition}</b> asset{stats.criticalCondition > 1 ? 's' : ''} in poor/critical condition</span>
                            </div>
                        )}
                        {!stats?.maintenanceDue && !stats?.inspectionOverdue && !stats?.warrantyExpiring && !stats?.pendingTransfers && (
                            <div className="text-sm text-green-600 text-center py-4">✅ No immediate actions required</div>
                        )}
                    </div>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
                        <Activity size={16} className="text-blue-500" />
                        <h2 className="text-sm font-semibold text-slate-800">Recent Activity</h2>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                        {activity.length === 0 ? (
                            <div className="text-sm text-slate-400 text-center py-4">No recent activity</div>
                        ) : activity.slice(0, 10).map((a, i) => (
                            <div key={i} onClick={() => navigate(`/assets/${a.asset_id}`)} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-slate-700 truncate">{a.asset_code} — {a.event_type?.replace(/_/g, ' ')}</div>
                                    {a.reason && <div className="text-xs text-slate-400 truncate">{a.reason}</div>}
                                    <div className="text-xs text-slate-400">{new Date(a.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <Card className="p-5">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2"><TrendingUp size={14} /> Assets by Category</h3>
                    {renderBar(charts?.byCategory, 'category', 'count')}
                </Card>
                <Card className="p-5">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Assets by Status</h3>
                    {renderBar(charts?.byStatus, 'status', 'count')}
                </Card>
                <Card className="p-5">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Assets by Condition</h3>
                    {renderBar(charts?.byCondition, 'condition', 'count')}
                </Card>
            </div>

            {/* Location Overview */}
            <Card>
                <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
                    <MapPin size={16} className="text-green-500" />
                    <h2 className="text-sm font-semibold text-slate-800">Location Overview</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                {['Location', 'Type', 'Total', 'Operational', 'Maintenance', 'Inspection', 'Critical'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {locations.map((loc, i) => (
                                <tr key={i} onClick={() => navigate('/locations')} className="hover:bg-slate-50 cursor-pointer">
                                    <td className="px-4 py-3 font-medium text-slate-800">{loc.location}</td>
                                    <td className="px-4 py-3 text-slate-500">{loc.type?.replace('_', ' ')}</td>
                                    <td className="px-4 py-3"><span className="font-bold text-slate-800">{loc.total_assets}</span></td>
                                    <td className="px-4 py-3 text-green-600">{loc.operational}</td>
                                    <td className="px-4 py-3 text-orange-600">{loc.under_maintenance}</td>
                                    <td className="px-4 py-3 text-yellow-600">{loc.under_inspection}</td>
                                    <td className="px-4 py-3 text-red-600">{loc.critical_condition}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
