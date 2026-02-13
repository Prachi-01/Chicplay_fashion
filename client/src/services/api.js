import axios from 'axios';

// Default to relative path which will be proxied by Vite
const API_URL = '/api';

const api = axios.create({
    baseURL: API_URL
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
