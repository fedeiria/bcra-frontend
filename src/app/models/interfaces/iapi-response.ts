export interface IApiResponse<T> {
    error: boolean;
    data?: T;
    message?: string;
    type?: 'danger' | 'warning' | 'info' | 'success';
    details?: string;
}