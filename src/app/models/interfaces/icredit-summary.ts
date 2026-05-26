import { ICheckDetail } from "./icheck-detail";
import { IDebtEntityDetail } from "./idebt-entity-detail";

export interface ICreditSummary {
    cuit: string;
    denominacion: string;
    periodo: string;
    situacion: number;
    deudaTotal: number;
    cantidadEntidades: number;
    entidadesDetalle: IDebtEntityDetail[];
    cheques: {
        cantidad: number;
        montoTotal: number;
        detalle: ICheckDetail[];
    };
}