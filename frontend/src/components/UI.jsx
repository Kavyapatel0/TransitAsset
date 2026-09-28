import React from 'react';
import { Loader2, PackageOpen, AlertCircle } from 'lucide-react';

export function LoadingState({ message = 'Loading...' }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Loader2 size={32} className="animate-spin mb-3" />
            <span className="text-sm">{message}</span>
        </div>
    );
}

export function EmptyState({ title = 'No data found', description = '', action }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <PackageOpen size={40} className="mb-3 text-slate-300" />
            <h3 className="text-sm font-medium text-slate-600 mb-1">{title}</h3>
            {description && <p className="text-xs text-slate-400 mb-4">{description}</p>}
            {action}
        </div>
    );
}

export function ErrorState({ message = 'Failed to load data', onRetry }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-red-400">
            <AlertCircle size={32} className="mb-3" />
            <p className="text-sm mb-3">{message}</p>
            {onRetry && <button onClick={onRetry} className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 hover:bg-red-100">Try Again</button>}
        </div>
    );
}

export function PageHeader({ title, subtitle, children }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
                <h1 className="text-xl font-bold text-slate-800">{title}</h1>
                {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            {children && <div className="flex items-center gap-2">{children}</div>}
        </div>
    );
}

export function Card({ children, className = '' }) {
    return <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>{children}</div>;
}

export function KpiCard({ title, value, subtitle, icon: Icon, color = 'blue', onClick }) {
    const colorMap = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-emerald-50 text-emerald-600',
        orange: 'bg-orange-50 text-orange-600',
        red: 'bg-red-50 text-red-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        purple: 'bg-purple-50 text-purple-600',
        gray: 'bg-slate-50 text-slate-600',
    };
    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-xl border border-slate-200 p-4 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
        >
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
                {Icon && <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[color] || colorMap.blue}`}>
                    <Icon size={16} />
                </div>}
            </div>
            <div className="text-2xl font-bold text-slate-800 mb-0.5">{value ?? '—'}</div>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
    );
}

export function FormField({ label, required, error, children }) {
    return (
        <div>
            {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
            {children}
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
    );
}

export function Select({ className = '', ...props }) {
    return (
        <select className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${className}`} {...props} />
    );
}

export function Input({ className = '', ...props }) {
    return (
        <input className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`} {...props} />
    );
}

export function Textarea({ className = '', ...props }) {
    return (
        <textarea className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y ${className}`} {...props} />
    );
}

export function Btn({ variant = 'primary', size = 'md', className = '', children, ...props }) {
    const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1';
    const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-sm' };
    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-400',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500',
        ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-400',
    };
    return <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>{children}</button>;
}
