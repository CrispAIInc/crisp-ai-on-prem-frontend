import { ACCESS_TOKEN_KEY, EXPIRES_AT_KEY, REFRESH_TOKEN_KEY } from '../globals';

export const tokenStorage = {
    setTokens({ accessToken, refreshToken, expiresIn }) {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        // store an absolute timestamp, not the relative "seconds from now"
        localStorage.setItem(EXPIRES_AT_KEY, String(Date.now() + expiresIn * 1000));
    },
    getAccessToken() {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    },
    getRefreshToken() {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },
    getExpiresAt() {
        return Number(localStorage.getItem(EXPIRES_AT_KEY)) || 0;
    },
    clear() {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(EXPIRES_AT_KEY);
    },
};