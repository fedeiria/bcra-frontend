export interface ICreditSummary {
    cuit: number;
    denominacion: string;
    periodo: string;
    situacion: number;
    deudaTotal: number;
    cantidadEntidades: number;

    cheques: {
        cantidad: number;
        montoTotal: number;
    };
}
