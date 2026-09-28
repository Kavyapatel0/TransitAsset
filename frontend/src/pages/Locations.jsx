import React, { useState, useEffect } from 'react';
import { locationService } from '../services';
import Modal from '../components/Modal';
import { LoadingState, EmptyState, ErrorState, PageHeader, Card, Btn, FormField, Input, Select } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { MapPin, Plus, Package } from 'lucide-react';
export default function Locations() {
    const { hasRole } = useAuth();
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: '', type: 'DEPOT', address: '', city: '', state: '', postal_code: '', contact_number: '' });

    const load = async () => {
        setLoading(true); setError('');
        try { const res = await locationService.getAll(); setLocations(res.data.data.locations); }
        catch { setError('Failed to load locations'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault(); setSaving(true);
        try { await locationService.create(form); setShowCreate(false); setForm({ name: '', type: 'DEPOT', address: '', city: '', state: '', postal_code: '', contact_number: '' }); load(); }
        catch (err) { alert(err.response?.data?.message || 'Failed'); }
        finally { setSaving(false); }
    };

    const TYPE_COLORS = { DEPOT: 'bg-blue-50 text-blue-700', WORKSHOP: 'bg-purple-50 text-purple-700', TERMINAL: 'bg-green-50 text-green-700', OFFICE: 'bg-slate-100 text-slate-700', CHARGING_STATION: 'bg-emerald-50 text-emerald-700' };

    return (
        <div className="space-y-4">
            <PageHeader title="Locations" subtitle={`${locations.length} registered locations`}>
                {hasRole('ADMIN') && <Btn size="sm" onClick={() => setShowCreate(true)}><Plus size={14} /> Add Location</Btn>}
            </PageHeader>

            {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={load} /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {locations.length === 0 ? <EmptyState title="No locations found" /> : locations.map(loc => (
                        <Card key={loc.id} className="p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold text-slate-800">{loc.name}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${TYPE_COLORS[loc.type] || TYPE_COLORS.OFFICE}`}>{loc.type?.replace('_', ' ')}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold text-slate-800">{loc.asset_count}</div>
                                    <div className="text-xs text-slate-400">assets</div>
                                </div>
                            </div>
                            {loc.address && <div className="text-xs text-slate-500 mt-2">{loc.address}</div>}
                            {loc.city && <div className="text-xs text-slate-400">{loc.city}{loc.state && `, ${loc.state}`}</div>}
                            {loc.manager_name && <div className="text-xs text-slate-500 mt-2">Manager: {loc.manager_name}</div>}
                            {loc.contact_number && <div className="text-xs text-slate-400">{loc.contact_number}</div>}
                        </Card>
                    ))}
                </div>
            )}

            <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add New Location">
                <form onSubmit={handleCreate} className="space-y-4">
                    <FormField label="Name" required><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></FormField>
                    <FormField label="Type">
                        <Select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                            {['DEPOT', 'WORKSHOP', 'TERMINAL', 'OFFICE', 'CHARGING_STATION', 'FUEL_STATION', 'STORAGE'].map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                        </Select>
                    </FormField>
                    <FormField label="Address"><Input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></FormField>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="City"><Input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} /></FormField>
                        <FormField label="State"><Input value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} /></FormField>
                        <FormField label="Postal Code"><Input value={form.postal_code} onChange={e => setForm(p => ({ ...p, postal_code: e.target.value }))} /></FormField>
                        <FormField label="Contact No."><Input value={form.contact_number} onChange={e => setForm(p => ({ ...p, contact_number: e.target.value }))} /></FormField>
                    </div>
                    <div className="flex gap-3 justify-end">
                        <Btn variant="secondary" type="button" onClick={() => setShowCreate(false)}>Cancel</Btn>
                        <Btn type="submit" disabled={saving}>{saving ? 'Saving…' : 'Add Location'}</Btn>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
