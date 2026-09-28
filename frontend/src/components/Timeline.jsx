import React from 'react';

export default function Timeline({ events }) {
    if (!events || events.length === 0) return <div className="text-sm text-slate-400 py-4">No lifecycle events recorded.</div>;

    const EVENT_ICONS = {
        PROCUREMENT: '📦', REGISTRATION: '📋', ASSIGNMENT: '📍', ACTIVATION: '✅',
        MAINTENANCE_STARTED: '🔧', MAINTENANCE_COMPLETED: '✅', INSPECTION_COMPLETED: '🔍',
        TRANSFER_STARTED: '🚛', TRANSFER_COMPLETED: '📬', STATUS_CHANGED: '🔄',
        RETIREMENT: '🏁', default: '📌'
    };

    return (
        <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
            {events.map((event, idx) => (
                <div key={event.id || idx} className="relative flex gap-4 mb-4 last:mb-0">
                    <div className="relative z-10 flex-shrink-0 w-8 h-8 bg-white border-2 border-blue-400 rounded-full flex items-center justify-center text-sm">
                        {EVENT_ICONS[event.event_type] || EVENT_ICONS.default}
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-lg p-3 border border-slate-200 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div>
                                <span className="text-sm font-medium text-slate-800">{event.event_type?.replace(/_/g, ' ')}</span>
                                {event.new_status && (
                                    <span className="ml-2 text-xs text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded">
                                        → {event.new_status.replace(/_/g, ' ')}
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-slate-400 flex-shrink-0">
                                {event.created_at ? new Date(event.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                            </span>
                        </div>
                        {event.reason && <p className="text-xs text-slate-600 mt-1">{event.reason}</p>}
                        {event.performed_by_name && <p className="text-xs text-slate-400 mt-1">By: {event.performed_by_name}</p>}
                        {event.location_name && <p className="text-xs text-slate-400">At: {event.location_name}</p>}
                    </div>
                </div>
            ))}
        </div>
    );
}
