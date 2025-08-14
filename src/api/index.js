import axios from 'axios';


const BACKEND_URL = import.meta.env.VITE_API_ENDPOINT;

const axiosInstance = axios.create({
    baseURL: BACKEND_URL,
});

axiosInstance.interceptors.request.use(
    (config) => {
        // add Authorization header if token is available
        const token = localStorage.getItem('accessToken');
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

const makeApiRequest = async (endpoint, method = 'get', data = null, headers = { 'Content-Type': 'application/json' }, config = {}) => {

    try {
        // add withCredentials
        config.withCredentials = true;
        const response = await axiosInstance({
            url: endpoint,
            method,
            data,
            headers,
            ...config,
        });
        return response.data;
    } catch (error) {
        console.error('Request failed because: ', error.message);
        throw error;
    }
};


export default makeApiRequest;