import { ISituationStyle } from "../interfaces/isituation-style";

export const CREDIT_SITUATUION_CONFIG: Record<number, ISituationStyle> = {
    0: {
        label: 'Sin clasificación',
        class: 'situacion-0',
        color: '#6c757d'
    },
    1: {
        label: 'Normal',
        class: 'situacion-1',
        color: '#28a745'
    },
    2: {
        label: 'Seguimiento especial',
        class: 'situacion-2',
        color: '#ffc107'
    },
    3: {
        label: 'Riesgo medio',
        class: 'situacion-3',
        color: '#fd7e14'
    },
    4: {
        label: 'Alto riesgo',
        class: 'situacion-4',
        color: '#dc3545'
    },
    5: {
        label: 'Irrecuperable',
        class: 'situacion-5',
        color: '#8b0000'
    }
};
