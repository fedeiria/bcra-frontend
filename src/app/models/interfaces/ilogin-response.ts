export interface ILoginResponse {
    error: boolean;
    message: string;
    data: {
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            username: string;
            role: string;
        }
    }
}