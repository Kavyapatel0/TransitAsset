import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Package, Wrench, ClipboardCheck, ArrowRightLeft,
    MapPin, Building2, BarChart3, Bell, Users, ScrollText,
    ChevronLeft, ChevronRight, LogOut, Settings, UserCircle, Bus
} from 'lucide-react';

const NAV_ITEMS = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/assets', label: 'Assets', icon: Package },
    { path: '/maintenance', label: 'Maintenance', icon: Wrench },
    { path: '/inspections', label: 'Inspections', icon: ClipboardCheck },
    { path: '/transfers', label: 'Transfers', icon: ArrowRightLeft },
    { path: '/locations', label: 'Locations', icon: MapPin },
    { path: '/departments', label: 'Departments', icon: Building2 },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
    { path: '/alerts', label: 'Alerts', icon: Bell },
    { path: '/users', label: 'Users', icon: Users, adminOnly: true },
    { path: '/audit-logs', label: 'Audit Logs', icon: ScrollText, adminOnly: true },
];

const ROLE_LABEL = { ADMIN: 'Administrator', DEPOT_MANAGER: 'Depot Manager', TECHNICIAN: 'Technician' };

export default function Layout({ children }) {
    const { user, logout, hasRole } = useAuth();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const visibleNav = NAV_ITEMS.filter(item => !item.adminOnly || hasRole('ADMIN'));

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar */}
            <aside className={`flex flex-col bg-slate-900 text-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} flex-shrink-0`}>
                {/* Logo */}
                <div className={`flex items-center gap-3 px-4 py-4 border-b border-slate-700 ${collapsed ? 'justify-center' : ''}`}>
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Bus size={18} className="text-white" />
                    </div>
                    {!collapsed && (
                        <div>
                            <div className="font-bold text-sm tracking-wide">TransitAsset</div>
                            <div className="text-xs text-slate-400">Asset Management</div>
                        </div>
                    )}
                </div>

                {/* Nav Items */}
                <nav className="flex-1 py-4 overflow-y-auto">
                    {visibleNav.map(({ path, label, icon: Icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-2.5 mx-2 mb-0.5 rounded-lg text-sm transition-colors ${isActive
                                    ? 'bg-blue-600 text-white font-medium'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                } ${collapsed ? 'justify-center' : ''}`
                            }
                            title={collapsed ? label : undefined}
                        >
                            <Icon size={18} className="flex-shrink-0" />
                            {!collapsed && <span>{label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* User Info + Logout */}
                <div className="border-t border-slate-700 p-3">
                    {!collapsed && (
                        <div className="flex items-center gap-2 px-2 py-2 mb-2">
                            <UserCircle size={32} className="text-slate-400 flex-shrink-0" />
                            <div className="overflow-hidden">
                                <div className="text-sm font-medium truncate">{user?.name}</div>
                                <div className="text-xs text-slate-400">{ROLE_LABEL[user?.role] || user?.role}</div>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors ${collapsed ? 'justify-center' : ''}`}
                    >
                        <LogOut size={16} />
                        {!collapsed && 'Sign Out'}
                    </button>
                </div>

                {/* Collapse toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute top-1/2 -right-3 z-10 w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
                    style={{ transform: 'translateY(-50%)' }}
                >
                    {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
                </button>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
                    <div className="text-sm text-slate-500">
                        Government Transport Authority — Asset Management System
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <span className="hidden sm:block">{user?.name}</span>
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            {user?.role?.replace('_', ' ')}
                        </span>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
