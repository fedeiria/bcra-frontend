// Generic interface for API responses from the exchange rate service, including an error flag, data of generic type T, and an optional message
export interface IExchangeApiResponse<T> {
  error: boolean;
  data: T;
  message?: string;
}

// Currency master data
export interface ICurrency {
  codigo: string;
  denominacion: string;
}

// Rate details for a specific date
export interface IRateDetail {
  codigoMoneda: string;
  descripcion: string;
  tipoPase: number;
  tipoCotizacion: number;
}

// Rates for a specific date, including the date and an array of rate details
export interface IRatesResponse {
  fecha: string | null;
  detalle: IRateDetail[];
}

// Metadata for the evolution response, including result set information and limit
export interface IEvolutionMetadata {
  resultset: {
    count: number;
    offset: number;
  };
  limit: number;
}

// Response structure for the evolution of exchange rates, including status, metadata, and an array of rate responses for each date
export interface IEvolutionResponse {
  status: number;
  metadata: IEvolutionMetadata;
  results: IRatesResponse[];
}