import { environment } from "../../../environments/environment";

export const APP_CONFIG = {
    api: {
        baseUrl: environment.apiUrl,
        authEndpoint: `${environment.apiUrl}/auth`,
    },
    session: {
        tokenKey: 'token',
        refreshTokenKey: 'refresh_token',
        userKey: 'current_user',
        timestampKey: 'login_timestamp'
    },
    security: {
        maxLoginAttempts: 5,
        allowedRoles: ['ADMIN', 'USER']
    }
};