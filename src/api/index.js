import axios from 'axios';


const BACKEND_URL = import.meta.env.VITE_API_ENDPOINT;

const axiosInstance = axios.create({
    baseURL: BACKEND_URL,
});

/**
 * Generic function for calling the backend API
 */

const makeApiRequest = async (endpoint, method = 'get', data = null, headers = { 'Content-Type': 'application/json' }, config = {}) => {

    try {
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