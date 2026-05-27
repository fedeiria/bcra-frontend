import { ICheckStatusConfig } from '../interfaces/icheck-status-config';

export const REJECTED_CHECK_CONFIG: Record<string, ICheckStatusConfig> = {
    'IMPAGA': { label: 'IMPAGA', class: 'badge-check status-critical' },
    'PAGA': { label: 'PAGA', class: 'badge-check status-success' },
    'EXIMIDA': { label: 'EXIMIDA', class: 'badge-check status-neutral' },
    'SUSPENDIDO': { label: 'SUSPENDIDA', class: 'badge-check status-warning' },
    'SUSPENDIDA': { label: 'SUSPENDIDA', class: 'badge-check status-warning' },
    'REGULARIZADO': { label: 'REGULARIZADO', class: 'badge-check status-success' },
    'NO_APLICA': { label: 'NO APLICA', class: 'badge-check status-pending' }
};