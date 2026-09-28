import React, { useState, useEffect } from 'react';
import { departmentService } from '../services';
import Modal from '../components/Modal';
import { LoadingState, EmptyState, ErrorState, PageHeader, Card, Btn, FormField, Input, Textarea } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { Plus, Building2, Users } from 'lucide-react';

export default function Departments() {
    const { hasRole } = useAuth();
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: '', description: '' });

    const load = async () => {
        setLoading(true); setError('');
        try { const res = await departmentService.getAll(); setDepartments(res.data.data.departments); }
        catch { setError('Failed to load departments'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault(); setSaving(true);
        try { await departmentService.create(form); setShowCreate(false); setForm({ name: '', description: '' }); load(); }
        catch (err) { alert(err.response?.data?.message || 'Failed'); }
        finally { setSaving(false); }
    };

    return (
        <div className="space-y-4">
            <PageHeader title="Departments" subtitle={`${departments.length} departments`}>
                {hasRole('ADMIN') && <Btn size="sm" onClick={() => setShowCreate(true)}><Plus size={14} /> Add Department</Btn>}
            </PageHeader>

            {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={load} /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {departments.length === 0 ? <EmptyState title="No departments found" /> : departments.map(dept => (
                        <Card key={dept.id} className="p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0"><Building2 size={20} className="text-indigo-600" /></div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-800">{dept.name}</h3>
                                    {dept.description && <p className="text-xs text-slate-500 mt-1">{dept.description}</p>}
                                    {dept.manager_name && <p className="text-xs text-slate-400 mt-2">Manager: {dept.manager_name}</p>}
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="flex items-center gap-1 text-xs text-slate-600"><Users size={12} />{dept.asset_count} assets</span>
                                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${dept.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{dept.status}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Department">
                <form onSubmit={handleCreate} className="space-y-4">
                    <FormField label="Name" required><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></FormField>
                    <FormField label="Description"><Textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></FormField>
                    <div className="flex gap-3 justify-end">
                        <Btn variant="secondary" type="button" onClick={() => setShowCreate(false)}>Cancel</Btn>
                        <Btn type="submit" disabled={saving}>{saving ? 'Saving…' : 'Add Department'}</Btn>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
