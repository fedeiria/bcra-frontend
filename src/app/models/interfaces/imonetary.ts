// Represent a monetary variable with its details and associated methodology
export interface IMonetaryVariable {
    idVariable: number;
    descripcion: string;
    categoria: string;
    tipoSerie: string;
    periodicidad: string;
    unidadExpresion: string;
    moneda: string;
    primerFechaInformada: string;
    ultFechaInformada: string;
    ultValorInformado: number;
    metodologia?: string;
}

// Represent a methodology with its ID and description
export interface IMonetaryMethodology {
    id: number;
    detalle: string;
}

// Represent a single item in the history of a monetary variable, with its date and value
export interface IMonetaryHistoryItem {
    fecha: string;
    valor: number;
}

// Represent the object structure for the history results of a monetary variable, linking the variable ID to its historical data
export interface IMonetaryHistoryResult {
    idVariable: number;
    detalle: IMonetaryHistoryItem[];
}