export type StatusIntent = 'info' | 'success' | 'warning' | 'error';

export const STATUS_INTENT_CLASS: Record<StatusIntent, string> = {
    info: 'border-blue-200 bg-blue-50 text-blue-700',
    success: 'border-emerald-200 bg-emerald-50 text-green-700',
    warning: 'border-orange-200 bg-orange-50 text-amber-700',
    error: 'border-red-200 bg-red-50 text-red-700',
};
