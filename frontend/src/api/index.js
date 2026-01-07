import client from './client';

export const productsApi = {
    getAll: async (activeOnly = true) => {
        const response = await client.get('/products', {
            params: { active_only: activeOnly },
        });
        return response.data;
    },

    create: async (data) => {
        const response = await client.post('/products', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await client.put(`/products/${id}`, data);
        return response.data;
    },
};

export const pricesApi = {
    getAll: async (productId = null, activeOnly = true) => {
        const response = await client.get('/prices', {
            params: { product_id: productId, active_only: activeOnly },
        });
        return response.data;
    },

    getAvailable: async (channel, productId = null) => {
        const response = await client.get('/prices/available', {
            params: { channel, product_id: productId },
        });
        return response.data;
    },

    create: async (data) => {
        const response = await client.post('/prices', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await client.put(`/prices/${id}`, data);
        return response.data;
    },
};

export const customersApi = {
    getAll: async (params = {}) => {
        const response = await client.get('/customers', { params });
        return response.data;
    },

    create: async (data) => {
        const response = await client.post('/customers', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await client.put(`/customers/${id}`, data);
        return response.data;
    },

    getHistory: async (id) => {
        const response = await client.get(`/customers/${id}/history`);
        return response.data;
    },
};

export const salesApi = {
    getAll: async (params = {}) => {
        const response = await client.get('/sales', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await client.get(`/sales/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await client.post('/sales', data);
        return response.data;
    },

    cancel: async (id) => {
        const response = await client.post(`/sales/${id}/cancel`);
        return response.data;
    },
};

export const inventoryApi = {
    getStock: async () => {
        const response = await client.get('/inventory/stock');
        return response.data;
    },

    getMovements: async (params = {}) => {
        const response = await client.get('/inventory/movements', { params });
        return response.data;
    },

    adjustment: async (data) => {
        const response = await client.post('/inventory/adjustment', data);
        return response.data;
    },
};

export const productionApi = {
    getAll: async (params = {}) => {
        const response = await client.get('/production', { params });
        return response.data;
    },

    create: async (data) => {
        const response = await client.post('/production', data);
        return response.data;
    },

    getSummary: async (startDate, endDate) => {
        const response = await client.get('/production/summary', {
            params: { start_date: startDate, end_date: endDate },
        });
        return response.data;
    },
};

export const syncApi = {
    push: async (transactions) => {
        const response = await client.post('/sync/push', { transactions });
        return response.data;
    },

    getStatus: async () => {
        const response = await client.get('/sync/status');
        return response.data;
    },

    getConflicts: async () => {
        const response = await client.get('/sync/conflicts');
        return response.data;
    },

    resolve: async (id, resolution) => {
        const response = await client.post(`/sync/resolve/${id}`, { resolution });
        return response.data;
    },
};
