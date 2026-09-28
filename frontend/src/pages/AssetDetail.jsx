import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Wrench, ArrowRightLeft, ClipboardCheck, Archive, RefreshCw, FileText } from 'lucide-react';
import { assetService, locationService } from '../services';
import { StatusBadge, ConditionBadge, WarrantyBadge, MaintenanceStatusBadge, InspectionResultBadge, TransferStatusBadge } from '../components/Badges';
import Timeline from '../components/Timeline';
import Modal, { ConfirmModal } from '../components/Modal';
import { LoadingState, ErrorState, Card, Btn, FormField, Select, Input, Textarea } from '../components/UI';
import { HEALTH_COLORS } from '../constants';
import { useAuth } from '../context/AuthContext';

const VALID_TRANSITIONS = {
    PROCURED: ['REGISTERED'], REGISTERED: ['ASSIGNED', 'RETIRED'], ASSIGNED: ['OPERATIONAL', 'RETIRED'],
    OPERATIONAL: ['UNDER_INSPECTION', 'UNDER_MAINTENANCE', 'TRANSFERRED', 'RETIRED'],
    UNDER_INSPECTION: ['OPERATIONAL', 'UNDER_MAINTENANCE'], UNDER_MAINTENANCE: ['OPERATIONAL'],
    TRANSFERRED: ['OPERATIONAL'], RETIRED: []
};

export default function AssetDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { hasRole, user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showRetireConfirm, setShowRetireConfirm] = useState(false);
    const [statusForm, setStatusForm] = useState({ new_status: '', reason: '' });
    const [locations, setLocations] = useState([]);

    const load = async () => {
        setLoading(true); setError('');
        try {
            const res = await assetService.getOne(id);
            setData(res.data.data);
        } catch { setError('Failed to load asset'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [id]);
    useEffect(() => { locationService.getAll().then(r => setLocations(r.data.data.locations)).catch(() => { }); }, []);

    const handleStatusChange = async () => {
        try {
            await assetService.changeStatus(id, statusForm);
            setShowStatusModal(false);
            setStatusForm({ new_status: '', reason: '' });
            load();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to change status');
        }
    };

    const handleRetire = async () => {
        try {
            await assetService.retire(id, { reason: 'Asset retired by administrator' });
            load();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to retire asset');
        }
    };

    if (loading) return <LoadingState message="Loading asset details…" />;
    if (error) return <ErrorState message={error} onRetry={load} />;
    if (!data) return null;

    const { asset, lifecycle, maintenance, inspections, transfers, documents, healthScore } = data;
    const hs = healthScore || {};
    const hcol = HEALTH_COLORS[hs.category] || HEALTH_COLORS.MONITOR;
    const allowedTransitions = VALID_TRANSITIONS[asset.status] || [];
    const tabs = ['overview', 'lifecycle', 'maintenance', 'inspections', 'transfers', 'documents'];

    const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
    const currency = (v) => v ? `₹${Number(v).toLocaleString('en-IN')}` : '—';

    return (
        <div className="space-y-4">
            {/* Back + actions */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <Link to="/assets" className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600">
                    <ArrowLeft size={16} /> Back to Assets
                </Link>
                <div className="flex items-center gap-2 flex-wrap">
                    {hasRole('ADMIN', 'DEPOT_MANAGER') && asset.status !== 'RETIRED' && (
                        <>
                            <Btn variant="secondary" size="sm" onClick={() => navigate(`/assets/${id}/edit`)}><Edit size={14} /> Edit</Btn>
                            <Btn variant="secondary" size="sm" onClick={() => setShowStatusModal(true)}><RefreshCw size={14} /> Change Status</Btn>
                            <Btn variant="secondary" size="sm" onClick={() => navigate(`/maintenance?asset_id=${id}&focus=create`)}><Wrench size={14} /> Report Issue</Btn>
                            <Btn variant="secondary" size="sm" onClick={() => navigate(`/inspections?asset_id=${id}&focus=create`)}><ClipboardCheck size={14} /> Inspect</Btn>
                            <Btn variant="secondary" size="sm" onClick={() => navigate(`/transfers?asset_id=${id}&focus=create`)}><ArrowRightLeft size={14} /> Transfer</Btn>
                        </>
                    )}
                    {hasRole('ADMIN') && asset.status !== 'RETIRED' && (
                        <Btn variant="danger" size="sm" onClick={() => setShowRetireConfirm(true)}><Archive size={14} /> Retire</Btn>
                    )}
                </div>
            </div>

            {/* Hero header */}
            <Card className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {asset.asset_code?.charAt(0)}
                        </div>
                        <div>
                            <div className="font-mono text-sm text-blue-600 font-semibold">{asset.asset_code}</div>
                            <h1 className="text-xl font-bold text-slate-800">{asset.name}</h1>
                            <div className="text-sm text-slate-500">{asset.asset_type} · {asset.category}</div>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <StatusBadge status={asset.status} />
                                <ConditionBadge condition={asset.condition} />
                                <WarrantyBadge expiryDate={asset.warranty_expiry} />
                            </div>
                        </div>
                    </div>
                    {/* Health Score */}
                    {hs.score !== undefined && (
                        <div className={`flex flex-col items-center px-5 py-3 rounded-xl border ${hcol.bg} ${hcol.border}`}>
                            <div className={`text-3xl font-bold ${hcol.text}`}>{hs.score}</div>
                            <div className="text-xs text-slate-500">/ 100</div>
                            <div className={`text-xs font-semibold mt-1 ${hcol.text}`}>{hs.category}</div>
                            <div className="text-xs text-slate-400">Health Score</div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-md text-sm font-medium capitalize flex-shrink-0 transition-colors ${activeTab === tab ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card className="p-5">
                        <h3 className="text-sm font-semibold text-slate-700 mb-4">Asset Details</h3>
                        <div className="space-y-3 text-sm">
                            {[
                                ['Code', asset.asset_code], ['Name', asset.name], ['Type', asset.asset_type],
                                ['Category', asset.category], ['Manufacturer', asset.manufacturer || '—'],
                                ['Model', asset.model || '—'], ['Serial Number', asset.serial_number || '—'],
                                ['Reg. Number', asset.registration_number || '—'],
                            ].map(([label, val]) => (
                                <div key={label} className="flex justify-between py-1 border-b border-slate-100 last:border-0">
                                    <span className="text-slate-500">{label}</span>
                                    <span className="font-medium text-slate-800">{val}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <Card className="p-5">
                        <h3 className="text-sm font-semibold text-slate-700 mb-4">Financial & Warranty</h3>
                        <div className="space-y-3 text-sm">
                            {[
                                ['Purchase Date', fmt(asset.purchase_date)], ['Purchase Cost', currency(asset.purchase_cost)],
                                ['Warranty Start', fmt(asset.warranty_start)], ['Warranty Expiry', fmt(asset.warranty_expiry)],
                                ['Ownership', asset.ownership_type?.replace(/_/g, ' ')],
                            ].map(([label, val]) => (
                                <div key={label} className="flex justify-between py-1 border-b border-slate-100 last:border-0">
                                    <span className="text-slate-500">{label}</span>
                                    <span className="font-medium text-slate-800">{val}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <Card className="p-5">
                        <h3 className="text-sm font-semibold text-slate-700 mb-4">Assignment & Location</h3>
                        <div className="space-y-3 text-sm">
                            {[
                                ['Location', asset.location_name || '—'], ['Department', asset.department_name || '—'],
                                ['Custodian', asset.custodian_name || '—'],
                                ['Last Inspection', fmt(asset.last_inspection_date)],
                                ['Next Inspection', fmt(asset.next_inspection_date)],
                                ['Last Maintenance', fmt(asset.last_maintenance_date)],
                            ].map(([label, val]) => (
                                <div key={label} className="flex justify-between py-1 border-b border-slate-100 last:border-0">
                                    <span className="text-slate-500">{label}</span>
                                    <span className="font-medium text-slate-800">{val}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                    {/* Vehicle specifics */}
                    {(asset.fuel_type || asset.seating_capacity || asset.vehicle_number) && (
                        <Card className="p-5">
                            <h3 className="text-sm font-semibold text-slate-700 mb-4">Vehicle Details</h3>
                            <div className="space-y-3 text-sm">
                                {[
                                    ['Vehicle No.', asset.vehicle_number || '—'], ['Fuel Type', asset.fuel_type || '—'],
                                    ['Seating', asset.seating_capacity ? `${asset.seating_capacity} seats` : '—'],
                                    ['Mileage', asset.mileage ? `${Number(asset.mileage).toLocaleString()} km` : '—'],
                                    ['Battery Cap.', asset.battery_capacity ? `${asset.battery_capacity} kWh` : '—'],
                                ].map(([label, val]) => (
                                    <div key={label} className="flex justify-between py-1 border-b border-slate-100 last:border-0">
                                        <span className="text-slate-500">{label}</span>
                                        <span className="font-medium text-slate-800">{val}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                    {/* Health Score Details */}
                    {hs.factors && (
                        <Card className="p-5 lg:col-span-2">
                            <h3 className="text-sm font-semibold text-slate-700 mb-4">Health Score Breakdown</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                {Object.entries(hs.factors).map(([key, f]) => (
                                    <div key={key} className="text-center p-3 bg-slate-50 rounded-lg">
                                        <div className="text-lg font-bold text-slate-800">{f.score}</div>
                                        <div className="text-xs text-slate-500 capitalize">{key}</div>
                                        <div className="text-xs text-slate-400">{f.weight}% weight</div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {activeTab === 'lifecycle' && (
                <Card className="p-5">
                    <h3 className="text-sm font-semibold text-slate-700 mb-5">Lifecycle History</h3>
                    <Timeline events={lifecycle} />
                </Card>
            )}

            {activeTab === 'maintenance' && (
                <Card>
                    <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-700">Maintenance History ({maintenance?.length || 0})</h3>
                        {hasRole('ADMIN', 'DEPOT_MANAGER') && <Btn size="sm" onClick={() => navigate(`/maintenance?asset_id=${id}&focus=create`)}>Report Issue</Btn>}
                    </div>
                    {maintenance?.length === 0 ? <div className="p-8 text-center text-sm text-slate-400">No maintenance records</div> : (
                        <div className="divide-y divide-slate-100">
                            {maintenance?.map(m => (
                                <div key={m.id} className="px-5 py-4 hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/maintenance/${m.id}`)}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="font-medium text-slate-800 text-sm">{m.title}</div>
                                            {m.diagnosis && <div className="text-xs text-slate-500 mt-1">{m.diagnosis}</div>}
                                            <div className="text-xs text-slate-400 mt-1">By: {m.technician_name || 'Unassigned'} · {fmt(m.reported_at)}</div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <MaintenanceStatusBadge status={m.status} />
                                            {m.maintenance_cost && <span className="text-xs text-slate-500">₹{Number(m.maintenance_cost).toLocaleString()}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}

            {activeTab === 'inspections' && (
                <Card>
                    <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-700">Inspection History ({inspections?.length || 0})</h3>
                        {hasRole('ADMIN', 'DEPOT_MANAGER', 'TECHNICIAN') && <Btn size="sm" onClick={() => navigate(`/inspections?asset_id=${id}&focus=create`)}>Add Inspection</Btn>}
                    </div>
                    {inspections?.length === 0 ? <div className="p-8 text-center text-sm text-slate-400">No inspection records</div> : (
                        <div className="divide-y divide-slate-100">
                            {inspections?.map(i => (
                                <div key={i.id} className="px-5 py-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="text-sm font-medium text-slate-800">{fmt(i.inspection_date)}</div>
                                            {i.findings && <div className="text-xs text-slate-500 mt-1">{i.findings}</div>}
                                            <div className="text-xs text-slate-400 mt-1">Inspector: {i.inspector_name || '—'}</div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <InspectionResultBadge result={i.result} />
                                            <ConditionBadge condition={i.condition} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}

            {activeTab === 'transfers' && (
                <Card>
                    <div className="px-5 py-4 border-b border-slate-200"><h3 className="text-sm font-semibold text-slate-700">Transfer History ({transfers?.length || 0})</h3></div>
                    {transfers?.length === 0 ? <div className="p-8 text-center text-sm text-slate-400">No transfer records</div> : (
                        <div className="divide-y divide-slate-100">
                            {transfers?.map(t => (
                                <div key={t.id} className="px-5 py-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="text-sm font-medium text-slate-800">{t.from_location_name || 'Unknown'} → {t.to_location_name}</div>
                                            {t.reason && <div className="text-xs text-slate-500 mt-1">{t.reason}</div>}
                                            <div className="text-xs text-slate-400 mt-1">Requested: {fmt(t.request_date)} · Approved by: {t.approved_by_name || '—'}</div>
                                        </div>
                                        <TransferStatusBadge status={t.status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}

            {activeTab === 'documents' && (
                <Card>
                    <div className="px-5 py-4 border-b border-slate-200"><h3 className="text-sm font-semibold text-slate-700">Documents ({documents?.length || 0})</h3></div>
                    {documents?.length === 0 ? <div className="p-8 text-center text-sm text-slate-400">No documents attached</div> : (
                        <div className="divide-y divide-slate-100">
                            {documents?.map(doc => (
                                <div key={doc.id} className="px-5 py-4 flex items-center gap-3">
                                    <FileText size={18} className="text-blue-400" />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-slate-800">{doc.document_name}</div>
                                        <div className="text-xs text-slate-400">{doc.document_type} · Uploaded {fmt(doc.created_at)}</div>
                                    </div>
                                    {doc.document_url && <a href={doc.document_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">View</a>}
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}

            {/* Change Status Modal */}
            <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} title="Change Asset Status">
                <div className="space-y-4">
                    <div className="p-3 bg-slate-50 rounded-lg text-sm">
                        <span className="text-slate-500">Current Status: </span>
                        <StatusBadge status={asset.status} />
                    </div>
                    {allowedTransitions.length === 0 ? (
                        <p className="text-sm text-red-600">No transitions allowed from {asset.status}.</p>
                    ) : (
                        <>
                            <FormField label="New Status" required>
                                <Select value={statusForm.new_status} onChange={e => setStatusForm(p => ({ ...p, new_status: e.target.value }))}>
                                    <option value="">Select new status…</option>
                                    {allowedTransitions.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                                </Select>
                            </FormField>
                            <FormField label="Reason" required>
                                <Input value={statusForm.reason} onChange={e => setStatusForm(p => ({ ...p, reason: e.target.value }))} placeholder="Reason for status change…" />
                            </FormField>
                            <div className="flex gap-3 justify-end">
                                <Btn variant="secondary" onClick={() => setShowStatusModal(false)}>Cancel</Btn>
                                <Btn onClick={handleStatusChange} disabled={!statusForm.new_status || !statusForm.reason}>Apply Change</Btn>
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            <ConfirmModal isOpen={showRetireConfirm} onClose={() => setShowRetireConfirm(false)} onConfirm={handleRetire}
                title="Retire Asset" message={`Are you sure you want to retire ${asset.asset_code}? This action creates a permanent lifecycle record and cannot be undone.`}
                confirmLabel="Retire Asset" danger />
        </div>
    );
}
