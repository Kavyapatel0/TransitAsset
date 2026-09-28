// Status badge colors
export const STATUS_COLORS = {
    PROCURED: 'bg-gray-100 text-gray-700 border-gray-300',
    REGISTERED: 'bg-blue-50 text-blue-700 border-blue-300',
    ASSIGNED: 'bg-purple-50 text-purple-700 border-purple-300',
    OPERATIONAL: 'bg-green-50 text-green-700 border-green-300',
    UNDER_INSPECTION: 'bg-yellow-50 text-yellow-700 border-yellow-300',
    UNDER_MAINTENANCE: 'bg-orange-50 text-orange-700 border-orange-300',
    TRANSFERRED: 'bg-indigo-50 text-indigo-700 border-indigo-300',
    RETIRED: 'bg-red-50 text-red-700 border-red-300',
};

export const CONDITION_COLORS = {
    EXCELLENT: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    GOOD: 'bg-green-50 text-green-700 border-green-300',
    FAIR: 'bg-yellow-50 text-yellow-700 border-yellow-300',
    POOR: 'bg-orange-50 text-orange-700 border-orange-300',
    CRITICAL: 'bg-red-50 text-red-700 border-red-300',
};

export const SEVERITY_COLORS = {
    INFO: 'bg-blue-50 text-blue-700 border-blue-300',
    WARNING: 'bg-yellow-50 text-yellow-700 border-yellow-300',
    HIGH: 'bg-orange-50 text-orange-700 border-orange-300',
    CRITICAL: 'bg-red-50 text-red-700 border-red-300',
};

export const PRIORITY_COLORS = {
    LOW: 'bg-gray-100 text-gray-700',
    MEDIUM: 'bg-blue-50 text-blue-700',
    HIGH: 'bg-orange-50 text-orange-700',
    CRITICAL: 'bg-red-50 text-red-700',
};

export const MAINTENANCE_STATUS_COLORS = {
    OPEN: 'bg-yellow-50 text-yellow-700',
    ASSIGNED: 'bg-blue-50 text-blue-700',
    IN_PROGRESS: 'bg-orange-50 text-orange-700',
    COMPLETED: 'bg-green-50 text-green-700',
    CANCELLED: 'bg-gray-100 text-gray-600',
};

export const TRANSFER_STATUS_COLORS = {
    REQUESTED: 'bg-yellow-50 text-yellow-700',
    APPROVED: 'bg-blue-50 text-blue-700',
    IN_TRANSIT: 'bg-orange-50 text-orange-700',
    COMPLETED: 'bg-green-50 text-green-700',
    REJECTED: 'bg-red-50 text-red-700',
};

export const INSPECTION_RESULT_COLORS = {
    PASS: 'bg-green-50 text-green-700',
    FAIL: 'bg-red-50 text-red-700',
    REQUIRES_ATTENTION: 'bg-yellow-50 text-yellow-700',
};

export const ASSET_CATEGORIES = ['Vehicles', 'Depot Infrastructure', 'Operational Equipment', 'General Infrastructure'];

export const ASSET_TYPES = {
    Vehicles: ['Diesel Bus', 'CNG Bus', 'Electric Bus'],
    'Depot Infrastructure': ['Charging Station', 'Fuel Station', 'Workshop Equipment', 'Depot Equipment'],
    'Operational Equipment': ['Ticketing Machine', 'GPS Device', 'CCTV Camera', 'Passenger Information Display', 'Security Equipment'],
    'General Infrastructure': ['Generator', 'Networking Equipment', 'Electrical Equipment', 'Office Equipment'],
};

export const ASSET_STATUSES = ['PROCURED', 'REGISTERED', 'ASSIGNED', 'OPERATIONAL', 'UNDER_INSPECTION', 'UNDER_MAINTENANCE', 'TRANSFERRED', 'RETIRED'];
export const ASSET_CONDITIONS = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL'];
export const OWNERSHIP_TYPES = ['GOVERNMENT_OWNED', 'PRIVATE', 'PPP', 'LEASED'];
export const FUEL_TYPES = ['DIESEL', 'CNG', 'ELECTRIC', 'HYBRID', 'PETROL'];

export const HEALTH_COLORS = {
    HEALTHY: { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    MONITOR: { text: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    ATTENTION: { text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
    CRITICAL: { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
};
