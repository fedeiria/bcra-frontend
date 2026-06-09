import { CREDIT_SITUATUION_CONFIG } from '../../models/constants/credit-situation-config';
import { REJECTED_CHECK_CONFIG } from '../../models/constants/rejected-check-config';
import { ICheckStatusConfig } from '../../models/interfaces/icheck-status-config';

/**
 * Gets the CSS class for the credit situation based on the configuration
 * @param situation The credit situation
 * @returns The CSS class for the given situation
 */
export function getSituationClass(situation: number): string {
    const validSituation = situation > 5 ? 0 : situation;
    return CREDIT_SITUATUION_CONFIG[validSituation]?.class || 'situacion-0';
}

/**
 * Gets the label for the credit situation based on the configuration
 * @param situation The credit situation
 * @returns The label for the given situation
 */
export function getSituationLabel(situation: number): string {
    const validSituation = situation > 5 ? 0 : situation;
    return CREDIT_SITUATUION_CONFIG[validSituation]?.label || 'Sin clasificación';
}

/**
 * Gets the configuration for the check status based on the cheque data, determining if it has a BCRA fine, if it has been regularized, or if no penalty applies, and returns the appropriate label and CSS class for display
 * @param cheque The cheque object to evaluate
 * @returns An object with the label and CSS class corresponding
 */
export function getCheckStatusConfig(cheque: any): ICheckStatusConfig {
    if (cheque.estadoMulta) {
        return REJECTED_CHECK_CONFIG[cheque.estadoMulta] || REJECTED_CHECK_CONFIG['NO_APLICA'];
    }
    if (cheque.fechaPago || cheque.fechaPagoMulta) {
        return REJECTED_CHECK_CONFIG['REGULARIZADO'];
    }
    
    return REJECTED_CHECK_CONFIG['NO_APLICA'];
}