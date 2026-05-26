import { ISituationStyle } from "../interfaces/isituation-style";

export const CREDIT_SITUATUION_CONFIG: Record<number, ISituationStyle> = {
    0: {
        label: 'Sin clasificación',
        class: 'situacion-0',
        color: '#6c757d'
    },
    1: {
        label: 'Situacion 1 - Normal',
        class: 'situacion-1',
        color: '#28a745'
    },
    2: {
        label: 'Situacion 2 - Seguimiento especial',
        class: 'situacion-2',
        color: '#ffc107'
    },
    3: {
        label: 'Situacion 3 - Riesgo medio',
        class: 'situacion-3',
        color: '#fd7e14'
    },
    4: {
        label: 'Situacion 4 - Alto riesgo',
        class: 'situacion-4',
        color: '#dc3545'
    },
    5: {
        label: 'Situacion 5 - Irrecuperable',
        class: 'situacion-5',
        color: '#8b0000'
    }
};