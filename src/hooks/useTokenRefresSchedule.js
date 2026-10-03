import { useEffect } from 'react';
import { tokenStorage } from '../utils/tokenStorage';
import makeApiRequest from '../api';

const REFRESH_BUFFER_MS = 30_000; // refresh 30s before actual expiry

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
                    const { data } = await makeApiRequest('/refresh', 'POST', { refreshToken });
                    tokenStorage.setTokens({
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                        expiresIn: data.expiresIn,
                    });
                    scheduleRefresh(); // chain the next one
                } catch {
                    tokenStorage.clear();
                    window.location.href = '/';
                }
            }, delay);
        }

        scheduleRefresh();

        return () => clearTimeout(timeoutId);
    }, [isLoggedIn]);
}