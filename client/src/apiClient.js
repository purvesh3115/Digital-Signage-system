import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_URL || 
                (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api');

const apiClient = axios.create({
    baseURL: BASE_URL
});

export default apiClient;
