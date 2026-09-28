import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { assetService, locationService, departmentService, userService } from '../services';
import { PageHeader, Card, FormField, Input, Select, Textarea, Btn, LoadingState } from '../components/UI';
import { ASSET_CATEGORIES, ASSET_TYPES, ASSET_CONDITIONS, OWNERSHIP_TYPES, FUEL_TYPES } from '../constants';

export default function AssetForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [locations, setLocations] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [users, setUsers] = useState([]);

    const [form, setForm] = useState({
        asset_code: '', name: '', asset_type: '', category: '', serial_number: '', registration_number: '',
        manufacturer: '', model: '', purchase_date: '', purchase_cost: '', warranty_start: '', warranty_expiry: '',
        ownership_type: 'GOVERNMENT_OWNED', location_id: '', department_id: '', custodian_id: '',
        condition: 'GOOD', description: '', fuel_type: '', seating_capacity: '', mileage: '', battery_capacity: '', vehicle_number: ''
    });

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
    const isVehicle = ['Diesel Bus', 'CNG Bus', 'Electric Bus'].includes(form.asset_type);
    const typeOptions = form.category ? ASSET_TYPES[form.category] || [] : [];

    useEffect(() => {
        Promise.all([locationService.getAll(), departmentService.getAll(), userService.getAll()]).then(([l, d, u]) => {
            setLocations(l.data.data.locations); setDepartments(d.data.data.departments); setUsers(u.data.data.users);
        });
        if (isEdit) {
            assetService.getOne(id).then(r => {
                const a = r.data.data.asset;
                const fmt = d => d ? d.split('T')[0] : '';
                setForm({
                    asset_code: a.asset_code || '', name: a.name || '', asset_type: a.asset_type || '', category: a.category || '',
                    serial_number: a.serial_number || '', registration_number: a.registration_number || '',
                    manufacturer: a.manufacturer || '', model: a.model || '',
                    purchase_date: fmt(a.purchase_date), purchase_cost: a.purchase_cost || '',
                    warranty_start: fmt(a.warranty_start), warranty_expiry: fmt(a.warranty_expiry),
                    ownership_type: a.ownership_type || 'GOVERNMENT_OWNED', location_id: a.location_id || '',
                    department_id: a.department_id || '', custodian_id: a.custodian_id || '',
                    condition: a.condition || 'GOOD', description: a.description || '',
                    fuel_type: a.fuel_type || '', seating_capacity: a.seating_capacity || '',
                    mileage: a.mileage || '', battery_capacity: a.battery_capacity || '', vehicle_number: a.vehicle_number || ''
                });
            }).finally(() => setLoading(false));
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true); setError('');
        try {
            const payload = { ...form };
            if (!isVehicle) { payload.fuel_type = null; payload.seating_capacity = null; payload.vehicle_number = null; payload.battery_capacity = null; }
            if (isEdit) { await assetService.update(id, payload); navigate(`/assets/${id}`); }
            else { const r = await assetService.create(payload); navigate(`/assets/${r.data.data.asset.id}`); }
        } catch (err) { setError(err.response?.data?.message || 'Failed to save asset'); }
        finally { setSaving(false); }
    };

    if (loading) return <LoadingState />;

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            <PageHeader title={isEdit ? 'Edit Asset' : 'Register New Asset'} subtitle={isEdit ? `Editing ${form.asset_code}` : 'Add a new asset to the inventory'}>
                <Btn variant="secondary" size="sm" onClick={() => navigate(isEdit ? `/assets/${id}` : '/assets')}><ArrowLeft size={14} /> Back</Btn>
            </PageHeader>

            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <Card className="p-5">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Asset Code" required>
                            <Input value={form.asset_code} onChange={e => set('asset_code', e.target.value)} placeholder="e.g. BUS-105" required disabled={isEdit} />
                        </FormField>
                        <FormField label="Asset Name" required>
                            <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Descriptive name" required />
                        </FormField>
                        <FormField label="Category" required>
                            <Select value={form.category} onChange={e => { set('category', e.target.value); set('asset_type', ''); }} required>
                                <option value="">Select category…</option>
                                {ASSET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </Select>
                        </FormField>
                        <FormField label="Asset Type" required>
                            <Select value={form.asset_type} onChange={e => set('asset_type', e.target.value)} required>
                                <option value="">Select type…</option>
                                {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                            </Select>
                        </FormField>
                        <FormField label="Manufacturer">
                            <Input value={form.manufacturer} onChange={e => set('manufacturer', e.target.value)} placeholder="e.g. Tata Motors" />
                        </FormField>
                        <FormField label="Model">
                            <Input value={form.model} onChange={e => set('model', e.target.value)} placeholder="e.g. Starbus Ultra" />
                        </FormField>
                        <FormField label="Serial Number">
                            <Input value={form.serial_number} onChange={e => set('serial_number', e.target.value)} placeholder="Unique serial number" />
                        </FormField>
                        <FormField label="Registration Number">
                            <Input value={form.registration_number} onChange={e => set('registration_number', e.target.value)} />
                        </FormField>
                    </div>
                </Card>

                <Card className="p-5">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Purchase & Warranty</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Purchase Date">
                            <Input type="date" value={form.purchase_date} onChange={e => set('purchase_date', e.target.value)} />
                        </FormField>
                        <FormField label="Purchase Cost (₹)">
                            <Input type="number" value={form.purchase_cost} onChange={e => set('purchase_cost', e.target.value)} min="0" step="1" />
                        </FormField>
                        <FormField label="Warranty Start">
                            <Input type="date" value={form.warranty_start} onChange={e => set('warranty_start', e.target.value)} />
                        </FormField>
                        <FormField label="Warranty Expiry">
                            <Input type="date" value={form.warranty_expiry} onChange={e => set('warranty_expiry', e.target.value)} />
                        </FormField>
                        <FormField label="Ownership Type">
                            <Select value={form.ownership_type} onChange={e => set('ownership_type', e.target.value)}>
                                {OWNERSHIP_TYPES.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
                            </Select>
                        </FormField>
                        <FormField label="Condition">
                            <Select value={form.condition} onChange={e => set('condition', e.target.value)}>
                                {['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL'].map(c => <option key={c} value={c}>{c}</option>)}
                            </Select>
                        </FormField>
                    </div>
                </Card>

                <Card className="p-5">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Assignment</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <FormField label="Location">
                            <Select value={form.location_id} onChange={e => set('location_id', e.target.value)}>
                                <option value="">Select location…</option>
                                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </Select>
                        </FormField>
                        <FormField label="Department">
                            <Select value={form.department_id} onChange={e => set('department_id', e.target.value)}>
                                <option value="">Select department…</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </Select>
                        </FormField>
                        <FormField label="Custodian">
                            <Select value={form.custodian_id} onChange={e => set('custodian_id', e.target.value)}>
                                <option value="">Select custodian…</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                            </Select>
                        </FormField>
                    </div>
                </Card>

                {isVehicle && (
                    <Card className="p-5">
                        <h3 className="text-sm font-semibold text-slate-700 mb-4">Vehicle Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField label="Vehicle Number"><Input value={form.vehicle_number} onChange={e => set('vehicle_number', e.target.value)} /></FormField>
                            <FormField label="Fuel Type"><Select value={form.fuel_type} onChange={e => set('fuel_type', e.target.value)}><option value="">Select…</option>{FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}</Select></FormField>
                            <FormField label="Seating Capacity"><Input type="number" value={form.seating_capacity} onChange={e => set('seating_capacity', e.target.value)} min="1" /></FormField>
                            <FormField label="Current Mileage (km)"><Input type="number" value={form.mileage} onChange={e => set('mileage', e.target.value)} min="0" /></FormField>
                            {form.fuel_type === 'ELECTRIC' && <FormField label="Battery Capacity (kWh)"><Input type="number" value={form.battery_capacity} onChange={e => set('battery_capacity', e.target.value)} min="0" step="0.1" /></FormField>}
                        </div>
                    </Card>
                )}

                <Card className="p-5">
                    <FormField label="Description"><Textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Additional asset notes…" /></FormField>
                </Card>

                <div className="flex gap-3 justify-end">
                    <Btn variant="secondary" type="button" onClick={() => navigate(isEdit ? `/assets/${id}` : '/assets')}>Cancel</Btn>
                    <Btn type="submit" disabled={saving}><Save size={14} />{saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Register Asset'}</Btn>
                </div>
            </form>
        </div>
    );
}
