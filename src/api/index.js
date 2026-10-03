import axios from 'axios';
import { getJwt } from '../services/auth.js';
import { tokenStorage } from '../utils/tokenStorage.js';


const BACKEND_URL = import.meta.env.VITE_API_ENDPOINT;

export const axiosInstance = axios.create({
    baseURL: BACKEND_URL,
});


// REFRESH TOKEN IMPLEMENTATION
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(callback) {
    refreshSubscribers.push(callback);
}

function onRefreshed(newAccessToken) {
    refreshSubscribers.forEach((callback) => callback(newAccessToken));
    refreshSubscribers = [];
}


axiosInstance.interceptors.request.use(
    (config) => {
        const token = tokenStorage.getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request error: ', error.message);
        return Promise.reject(error);
    }
);

// On 401, refresh once, retry queued requests
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (!isRefreshing) {
            isRefreshing = true;

            try {
                const refreshToken = tokenStorage.getRefreshToken();
                if (!refreshToken) throw new Error('No refresh token available');

                // Plain axios call here, not `api` — avoids re-triggering this same interceptor
                const { data } = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/refresh`,
                    { refreshToken }
                );

                tokenStorage.setTokens({
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                    expiresIn: data.expiresIn,
                });

                isRefreshing = false;
                onRefreshed(data.accessToken);
            } catch (refreshError) {
                isRefreshing = false;
                refreshSubscribers = [];
                tokenStorage.clear();
                window.location.href = '/'; // session truly dead, force re-login
                return Promise.reject(refreshError);
            }
        }

        // Queue this request until the in-flight refresh resolves
        return new Promise((resolve) => {
            subscribeTokenRefresh((newAccessToken) => {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                resolve(axiosInstance(originalRequest));
            });
        });
    }
);

/**
 * Generic function for calling the backend API
 */

const makeApiRequest = async (
    endpoint,
    method = 'get',
    data = null,
    headers = { 'Content-Type': 'application/json' },
    config = {}
) => {
    try {
        const response = await axiosInstance({
            url: endpoint,
            method,
            ...(method.toLowerCase() === 'get' ? { params: data } : { data }),
            headers,
            ...config,
        });

        // Optional: if backend uses success=false even with 200
        if (response.data?.success === false) {
            const error = new Error(response.data.message || 'Request failed');
            error.data = response.data;
            throw error;
        }

        return response.data;
    } catch (error) {
        // Axios error (backend responded)
        if (error.response) {
            const backendError = error.response.data;

            const customError = new Error(
                backendError?.message || 'Something went wrong'
            );

            customError.status = error.response.status;
            customError.data = backendError;

            throw customError;
        }

        // Network / timeout / unexpected error
        const unknownError = new Error(
            error.message || 'Network error'
        );

        throw unknownError;
    }
};



export default makeApiRequest;