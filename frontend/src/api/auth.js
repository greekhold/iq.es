import client from './client';

export const authApi = {
    login: async (email, password) => {
        const response = await client.post('/auth/login', { email, password });
        return response.data;
    },

    logout: async () => {
        const response = await client.post('/auth/logout');
        return response.data;
    },

    me: async () => {
        const response = await client.get('/auth/me');
        return response.data;
    },

    refresh: async () => {
        const response = await client.post('/auth/refresh');
        return response.data;
    },
};

export default authApi;
