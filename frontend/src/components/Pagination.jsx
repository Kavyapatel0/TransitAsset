import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ pagination, onPageChange }) {
    if (!pagination || pagination.totalPages <= 1) return null;
    const { page, totalPages, total, limit } = pagination;
    const from = (page - 1) * limit + 1;
    const to = Math.min(page * limit, total);

    const pages = [];
    const delta = 2;
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
        pages.push(i);
    }

    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-white">
            <div className="text-sm text-slate-500">
                Showing <span className="font-medium">{from}–{to}</span> of <span className="font-medium">{total}</span> results
            </div>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronLeft size={16} />
                </button>
                {pages[0] > 1 && <><button onClick={() => onPageChange(1)} className="px-3 py-1.5 rounded text-sm text-slate-600 hover:bg-slate-100">1</button><span className="text-slate-400">...</span></>}
                {pages.map(p => (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={`px-3 py-1.5 rounded text-sm font-medium ${p === page ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                        {p}
                    </button>
                ))}
                {pages[pages.length - 1] < totalPages && <><span className="text-slate-400">...</span><button onClick={() => onPageChange(totalPages)} className="px-3 py-1.5 rounded text-sm text-slate-600 hover:bg-slate-100">{totalPages}</button></>}
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}
