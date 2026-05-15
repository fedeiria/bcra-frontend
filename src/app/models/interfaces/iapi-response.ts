export interface IApiResponse<T> {
    error: boolean;
    data?: T;
    message?: string;
    details?: string;
}
