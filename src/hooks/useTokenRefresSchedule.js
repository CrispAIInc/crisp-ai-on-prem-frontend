import { useEffect } from 'react';
import axios from 'axios';
import { tokenStorage } from '../utils/tokenStorage';

const REFRESH_BUFFER_MS = 30_000; // refresh 30s before actual expiry
const BACKEND_URL = import.meta.env.VITE_API_ENDPOINT;

export default function useTokenRefreshSchedule(isLoggedIn) {
    useEffect(() => {
        if (!isLoggedIn) return;

        let timeoutId;

        function scheduleRefresh() {
            const expiresAt = tokenStorage.getExpiresAt();
            const delay = Math.max(expiresAt - Date.now() - REFRESH_BUFFER_MS, 0);

            timeoutId = setTimeout(async () => {
                try {
                    const refreshToken = tokenStorage.getRefreshToken();
                    if (!refreshToken) throw new Error('No refresh token available');

                    // Plain axios — same as the 401 interceptor, avoids interceptor recursion
                    const { data } = await axios.post(`${BACKEND_URL}/refresh`, { refreshToken });
                    tokenStorage.setTokens({
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                        expiresIn: data.expiresIn,
                    });
                    scheduleRefresh(); // chain the next one
                } catch {
                    tokenStorage.clear();
                    window.location.href = '/login';
                }
            }, delay);
        }

        scheduleRefresh();

        return () => clearTimeout(timeoutId);
    }, [isLoggedIn]);
}