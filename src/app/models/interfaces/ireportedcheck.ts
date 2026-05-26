import { IReportedCheckDetail } from "./ireported-check-detail";

export interface IReportedCheck {
    status: number;
    results: {
        numeroCheque: number;
        denunciado: boolean;
        fechaProcesamiento: string;
        denominacionEntidad: string;
        detalles: IReportedCheckDetail[];
    };
}