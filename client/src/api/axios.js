import axios from 'axios';

const api = axios.create({
    baseURL: '/api/v1',
    withCredentials: true, // send cookies
    headers: { 'Content-Type': 'application/json' },
});

// Auto-refresh on 401
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;
            try {
                await axios.post('/api/v1/auth/refresh-token', {}, { withCredentials: true });
                return api(original);
            } catch {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
