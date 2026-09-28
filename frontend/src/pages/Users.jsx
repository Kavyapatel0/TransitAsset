import React, { useState, useEffect } from 'react';
import { userService } from '../services';
import Modal from '../components/Modal';
import { LoadingState, EmptyState, ErrorState, PageHeader, Card, Btn, FormField, Input, Select } from '../components/UI';
import { Plus, UserCircle } from 'lucide-react';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', role_id: '' });

    const load = async () => {
        setLoading(true); setError('');
        try {
            const [u, r] = await Promise.all([userService.getAll(), userService.getRoles()]);
            setUsers(u.data.data.users); setRoles(r.data.data.roles);
        } catch { setError('Failed to load users'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault(); setSaving(true);
        try { await userService.create(form); setShowCreate(false); setForm({ name: '', email: '', password: '', role_id: '' }); load(); }
        catch (err) { alert(err.response?.data?.message || 'Failed'); }
        finally { setSaving(false); }
    };

    const toggleStatus = async (u) => {
        try { await userService.update(u.id, { status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }); load(); }
        catch (err) { alert(err.response?.data?.message || 'Failed'); }
    };

    const ROLE_COLORS = { ADMIN: 'bg-red-50 text-red-700', DEPOT_MANAGER: 'bg-blue-50 text-blue-700', TECHNICIAN: 'bg-green-50 text-green-700' };

    return (
        <div className="space-y-4">
            <PageHeader title="User Management" subtitle={`${users.length} users`}>
                <Btn size="sm" onClick={() => setShowCreate(true)}><Plus size={14} /> Add User</Btn>
            </PageHeader>

            <Card>
                {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={load} /> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>{['User', 'Role', 'Department', 'Location', 'Status', 'Last Login', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                ))}</tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.length === 0 ? <tr><td colSpan={7}><EmptyState title="No users" /></td></tr> : users.map(u => (
                                    <tr key={u.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 flex items-center gap-2">
                                            <UserCircle size={30} className="text-slate-400" />
                                            <div>
                                                <div className="font-medium text-slate-800">{u.name}</div>
                                                <div className="text-xs text-slate-400">{u.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded font-medium ${ROLE_COLORS[u.role] || 'bg-slate-100 text-slate-700'}`}>{u.role?.replace(/_/g, ' ')}</span></td>
                                        <td className="px-4 py-3 text-xs text-slate-500">{u.department_name || '—'}</td>
                                        <td className="px-4 py-3 text-xs text-slate-500">{u.location_name || '—'}</td>
                                        <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded font-medium ${u.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{u.status}</span></td>
                                        <td className="px-4 py-3 text-xs text-slate-400">{u.last_login_at ? new Date(u.last_login_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Never'}</td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => toggleStatus(u)} className={`text-xs px-2 py-1 rounded border ${u.status === 'ACTIVE' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                                                {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add New User">
                <form onSubmit={handleCreate} className="space-y-4">
                    <FormField label="Full Name" required><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></FormField>
                    <FormField label="Email" required><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required /></FormField>
                    <FormField label="Password" required><Input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required minLength={8} /></FormField>
                    <FormField label="Role" required>
                        <Select value={form.role_id} onChange={e => setForm(p => ({ ...p, role_id: e.target.value }))} required>
                            <option value="">Select role…</option>
                            {roles.map(r => <option key={r.id} value={r.id}>{r.name.replace(/_/g, ' ')}</option>)}
                        </Select>
                    </FormField>
                    <div className="flex gap-3 justify-end">
                        <Btn variant="secondary" type="button" onClick={() => setShowCreate(false)}>Cancel</Btn>
                        <Btn type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create User'}</Btn>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
