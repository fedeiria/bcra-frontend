export const APP_CONFIG = {
    api: {
        baseUrl: 'http://localhost:3000',
        authEndpoint: 'http://localhost:3000/auth',
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