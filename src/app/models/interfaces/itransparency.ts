export interface IProductPackage {
    descripcionEntidad: string;
    nombreCompleto: string;
    comisionMaximaMantenimiento: number;
    ingresoMinimoMensual: number;
    segmento: string;
    productosIntegrantes: string;
}

export interface ICreditCard {
    codigoEntidad: number;
    descripcionEntidad: string;
    nombreCompleto: string;
    segmento: string;
    comisionMaximaAdministracionMantenimiento: number;
    comisionMaximaRenovacion: number;
    tasaEfectivaAnualMaximaFinanciacion: number;
    ingresoMinimoMensual: number;
}

export interface IFixedTerm {
    codigoEntidad: number;
    descripcionEntidad: string;
    nombreCompleto: string;
    nombreCorto: string;
    montoMinimoInvertir: number;
    plazoMinimoInvertirDias: number;
    canalConstitucion: string;
    tasaEfectivaAnualMinima: number;
    territorioValidez: string;
    fechaInformacion: string;
    denominacion?: string | null;
    masInformacion?: string | null;
}

export interface ISavingsAccount {
    codigoEntidad: number;
    descripcionEntidad: string;
    fechaInformacion: string;
    procesoSimplificadoDebidaDiligencia: string;
}

export interface IPersonalLoan {
    codigoEntidad: number;
    descripcionEntidad: string;
    nombreCompleto: string;
    nombreCorto: string;
    denominacion: string;
    montoMinimoOtorgable: number;
    montoMaximoOtorgable: number;
    plazoMaximoOtorgable: number;
    ingresoMinimoMensual: number;
    tasaEfectivaAnualMaxima: number;
    costoFinancieroEfectivoTotalMaximo: number;
    cuotaInicial: number;
    relacionCuotaIngreso: number;
    tipoTasa: string;
    fechaInformacion: string;
}