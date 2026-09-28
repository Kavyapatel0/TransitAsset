import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Edit, Wrench, ArrowRightLeft, ClipboardCheck } from 'lucide-react';
import { assetService, locationService, departmentService } from '../services';
import { StatusBadge, ConditionBadge, WarrantyBadge } from '../components/Badges';
import Pagination from '../components/Pagination';
import { LoadingState, EmptyState, ErrorState, PageHeader, Card, Btn } from '../components/UI';
import { ASSET_CATEGORIES, ASSET_STATUSES, ASSET_CONDITIONS, ASSET_TYPES } from '../constants';
import { useAuth } from '../context/AuthContext';

export default function Assets() {
    const { hasRole } = useAuth();
    const navigate = useNavigate();

    const [assets, setAssets] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [locations, setLocations] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const [params, setParams] = useState({
        search: '', status: '', category: '', condition: '', location_id: '',
        department_id: '', ownership_type: '', warranty: '', page: 1, limit: 20
    });

    const fetchAssets = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const res = await assetService.getAll(params);
            setAssets(res.data.data.assets);
            setPagination(res.data.data.pagination);
        } catch { setError('Failed to load assets'); }
        finally { setLoading(false); }
    }, [params]);

    useEffect(() => {
        fetchAssets();
    }, [fetchAssets]);

    useEffect(() => {
        Promise.all([locationService.getAll(), departmentService.getAll()]).then(([l, d]) => {
            setLocations(l.data.data.locations);
            setDepartments(d.data.data.departments);
        }).catch(() => { });
    }, []);

    const setFilter = (key, val) => setParams(p => ({ ...p, [key]: val, page: 1 }));
    const resetFilters = () => setParams({ search: '', status: '', category: '', condition: '', location_id: '', department_id: '', ownership_type: '', warranty: '', page: 1, limit: 20 });

    return (
        <div className="space-y-4">
            <PageHeader title="Asset Registry" subtitle={`${pagination?.total ?? '...'} assets in inventory`}>
                {hasRole('ADMIN', 'DEPOT_MANAGER') && (
                    <Btn onClick={() => navigate('/assets/create')} size="sm">
                        <Plus size={14} /> Register Asset
                    </Btn>
                )}
            </PageHeader>

            {/* Search + Filter bar */}
            <Card className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Search by ID, name, serial no., manufacturer…"
                            value={params.search}
                            onChange={e => setFilter('search', e.target.value)}
                        />
                    </div>
                    <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={params.status} onChange={e => setFilter('status', e.target.value)}>
                        <option value="">All Statuses</option>
                        {ASSET_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                    <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={params.category} onChange={e => setFilter('category', e.target.value)}>
                        <option value="">All Categories</option>
                        {ASSET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <Btn variant="secondary" size="sm" onClick={() => setShowFilters(!showFilters)}>
                        <Filter size={14} /> {showFilters ? 'Hide' : 'More'} Filters
                    </Btn>
                </div>

                {showFilters && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-100">
                        <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" value={params.condition} onChange={e => setFilter('condition', e.target.value)}>
                            <option value="">All Conditions</option>
                            {ASSET_CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" value={params.location_id} onChange={e => setFilter('location_id', e.target.value)}>
                            <option value="">All Locations</option>
                            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                        <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" value={params.warranty} onChange={e => setFilter('warranty', e.target.value)}>
                            <option value="">All Warranty</option>
                            <option value="active">Active</option>
                            <option value="expiring">Expiring (30d)</option>
                            <option value="expired">Expired</option>
                        </select>
                        <Btn variant="ghost" size="sm" onClick={resetFilters}>Clear All</Btn>
                    </div>
                )}
            </Card>

            {/* Table */}
            <Card>
                {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={fetchAssets} /> : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        {['Asset ID', 'Name / Type', 'Location', 'Status', 'Condition', 'Warranty', 'Last Maint.', 'Actions'].map(h => (
                                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {assets.length === 0 ? (
                                        <tr><td colSpan={8}><EmptyState title="No assets found" description="Try adjusting your filters" /></td></tr>
                                    ) : assets.map(asset => (
                                        <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{asset.asset_code}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-800">{asset.name}</div>
                                                <div className="text-xs text-slate-400">{asset.asset_type} · {asset.category}</div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 text-xs">{asset.location_name || '—'}</td>
                                            <td className="px-4 py-3"><StatusBadge status={asset.status} /></td>
                                            <td className="px-4 py-3"><ConditionBadge condition={asset.condition} /></td>
                                            <td className="px-4 py-3"><WarrantyBadge expiryDate={asset.warranty_expiry} /></td>
                                            <td className="px-4 py-3 text-xs text-slate-500">
                                                {asset.last_maintenance_date ? new Date(asset.last_maintenance_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => navigate(`/assets/${asset.id}`)} className="p-1.5 rounded text-slate-500 hover:bg-blue-50 hover:text-blue-600" title="View">
                                                        <Eye size={14} />
                                                    </button>
                                                    {hasRole('ADMIN', 'DEPOT_MANAGER') && (
                                                        <button onClick={() => navigate(`/assets/${asset.id}/edit`)} className="p-1.5 rounded text-slate-500 hover:bg-slate-100 hover:text-slate-700" title="Edit">
                                                            <Edit size={14} />
                                                        </button>
                                                    )}
                                                    {hasRole('ADMIN', 'DEPOT_MANAGER') && asset.status !== 'RETIRED' && (
                                                        <button onClick={() => navigate(`/maintenance?asset_id=${asset.id}`)} className="p-1.5 rounded text-slate-500 hover:bg-orange-50 hover:text-orange-600" title="Maintenance">
                                                            <Wrench size={14} />
                                                        </button>
                                                    )}
                                                    {hasRole('ADMIN', 'DEPOT_MANAGER') && asset.status !== 'RETIRED' && (
                                                        <button onClick={() => navigate(`/transfers?asset_id=${asset.id}`)} className="p-1.5 rounded text-slate-500 hover:bg-indigo-50 hover:text-indigo-600" title="Transfer">
                                                            <ArrowRightLeft size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination pagination={pagination} onPageChange={page => setParams(p => ({ ...p, page }))} />
                    </>
                )}
            </Card>
        </div>
    );
}
