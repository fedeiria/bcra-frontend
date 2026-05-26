import { ICreditSummary } from "./icredit-summary";
import { IHistoricalItem } from "./ihistorical-item";

export interface IBatchItem {
    cuit: string;
    denominacion?: string;
    success: boolean;
    data: ICreditSummary | null;
    errorMessage?: string | null;
    showDetail: boolean;
    loadingHistory?: boolean;
    historicalData?: IHistoricalItem[];
}