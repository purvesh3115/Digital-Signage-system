import axios from 'axios';

const preferredApiUrls = [
    import.meta.env.VITE_API_URL,
    'http://localhost:5001/api',
    'http://localhost:5000/api',
    '/api'
].filter(Boolean);

export const BASE_URL = window.location.hostname === 'localhost'
    ? preferredApiUrls.find(url => url.startsWith('http')) || preferredApiUrls[0]
    : preferredApiUrls[preferredApiUrls.length - 1];

const apiClient = axios.create({
    baseURL: BASE_URL
});

export default apiClient;
