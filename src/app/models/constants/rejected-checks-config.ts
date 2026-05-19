import { ICheckStatusConfig } from '../interfaces/icheck-status-config';

export const REJECTED_CHECKS_CONFIG: Record<string, ICheckStatusConfig> = {
    'IMPAGA': {
        label: 'IMPAGA',
        class: 'bg-danger-subtle text-danger border border-danger-subtle'
    },
    'PAGA': {
        label: 'PAGA',
        class: 'bg-success-subtle text-success border border-success-subtle'
    },
    'EXIMIDA': {
        label: 'EXIMIDA',
        class: 'bg-secondary-subtle text-secondary border border-secondary-subtle'
    },
    'SUSPENDIDO': {
        label: 'SUSPENDIDO',
        class: 'bg-warning-subtle text-warning border border-warning-subtle'
    },
    'SUSPENDIDA': {
        label: 'SUSPENDIDA',
        class: 'bg-warning-subtle text-warning border border-warning-subtle'
    },
    'REGULARIZADO': {
        label: 'REGULARIZADO',
        class: 'bg-success text-white'
    },
    'NO_APLICA': {
        label: 'No Aplica',
        class: 'text-muted bg-light'
    }
};