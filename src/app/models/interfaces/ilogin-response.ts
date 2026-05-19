export interface ILoginResponse {
    error: boolean;
    message: string;
    data: {
        accessToken: string;
        user: {
            email: string;
            username: string;
            role: string;
        }
    }
}
