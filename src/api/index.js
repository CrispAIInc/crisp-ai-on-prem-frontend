import axios from 'axios';
import { getJwt } from '../services/auth.js';


const BACKEND_URL = import.meta.env.VITE_API_ENDPOINT;

export const axiosInstance = axios.create({
    baseURL: BACKEND_URL,
});



axiosInstance.interceptors.request.use(
    async (config) => {
        const token = await getJwt();
        // add Authorization header if token is available
        // const token = localStorage.getItem(TOKEN_NAME);
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        } else {
            delete config.headers['Authorization'];
        }

        return config;
    },
    (error) => {
        console.error('Request error: ', error.message);
        return Promise.reject(error);
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