import React from 'react';
import {
    STATUS_COLORS, CONDITION_COLORS, SEVERITY_COLORS, PRIORITY_COLORS,
    MAINTENANCE_STATUS_COLORS, TRANSFER_STATUS_COLORS, INSPECTION_RESULT_COLORS
} from '../constants';

export const StatusBadge = ({ status }) => {
    const cls = STATUS_COLORS[status] || 'bg-gray-100 text-gray-700 border-gray-300';
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cls}`}>
            {status?.replace(/_/g, ' ')}
        </span>
    );
};

export const ConditionBadge = ({ condition }) => {
    const cls = CONDITION_COLORS[condition] || 'bg-gray-100 text-gray-700 border-gray-300';
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cls}`}>
            {condition}
        </span>
    );
};

export const SeverityBadge = ({ severity }) => {
    const cls = SEVERITY_COLORS[severity] || 'bg-gray-100 text-gray-700 border-gray-300';
    return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cls}`}>{severity}</span>;
};

export const PriorityBadge = ({ priority }) => {
    const cls = PRIORITY_COLORS[priority] || 'bg-gray-100 text-gray-700';
    return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{priority}</span>;
};

export const MaintenanceStatusBadge = ({ status }) => {
    const cls = MAINTENANCE_STATUS_COLORS[status] || 'bg-gray-100 text-gray-700';
    return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{status?.replace(/_/g, ' ')}</span>;
};

export const TransferStatusBadge = ({ status }) => {
    const cls = TRANSFER_STATUS_COLORS[status] || 'bg-gray-100 text-gray-700';
    return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{status?.replace(/_/g, ' ')}</span>;
};

export const InspectionResultBadge = ({ result }) => {
    const cls = INSPECTION_RESULT_COLORS[result] || 'bg-gray-100 text-gray-700';
    return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{result?.replace(/_/g, ' ')}</span>;
};

export const WarrantyBadge = ({ expiryDate }) => {
    if (!expiryDate) return <span className="text-xs text-gray-400">N/A</span>;
    const days = Math.floor((new Date(expiryDate) - new Date()) / 86400000);
    if (days < 0) return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">EXPIRED</span>;
    if (days <= 30) return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">EXPIRING ({days}d)</span>;
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">ACTIVE</span>;
};
