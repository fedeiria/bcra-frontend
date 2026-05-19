export interface ICheckDetail {
    nroCheque: number;
    fechaRechazo: string;      // Format "YYYY-MM-DD"
    monto: number;
    fechaPago: string | null;
    fechaPagoMulta: string | null;
    estadoMulta: string;
    ctaPersonal: boolean;
    denomJuridica: string | null;
    enRevision: boolean;
    procesoJud: boolean;
    causal: string;
    codigoEntidad: number;
}
