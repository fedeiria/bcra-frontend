export const APP_CONFIG = {
    api: {
        baseUrl: 'http://localhost:3000',
        authEndpoint: 'http://localhost:3000/auth',
    },
    session: {
        tokenExpirationMs: 2 * 60 * 60 * 1000, // 2hs
        tokenKey: 'bcra_token',
        userKey: 'current_user',
        timestampKey: 'login_timestamp'
    },
    security: {
        maxLoginAttempts: 5,
        allowedRoles: ['ADMIN', 'CREDITS_USER', 'VIEWER']
    }
};