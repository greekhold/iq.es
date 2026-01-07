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

// NEW: Supplies API
export const suppliesApi = {
    getAll: async (activeOnly = true) => {
        const response = await client.get('/supplies', {
            params: { active_only: activeOnly },
        });
        return response.data;
    },

    getLowStock: async () => {
        const response = await client.get('/supplies/low-stock');
        return response.data;
    },

    create: async (data) => {
        const response = await client.post('/supplies', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await client.put(`/supplies/${id}`, data);
        return response.data;
    },

    adjust: async (id, quantity) => {
        const response = await client.post(`/supplies/${id}/adjust`, { quantity });
        return response.data;
    },
};

// NEW: Purchases API
export const purchasesApi = {
    getAll: async (params = {}) => {
        const response = await client.get('/purchases', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await client.get(`/purchases/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await client.post('/purchases', data);
        return response.data;
    },

    getSummary: async (startDate, endDate) => {
        const response = await client.get('/purchases/summary', {
            params: { start_date: startDate, end_date: endDate },
        });
        return response.data;
    },
};

// NEW: Expenses API
export const expensesApi = {
    getAll: async (params = {}) => {
        const response = await client.get('/expenses', { params });
        return response.data;
    },

    create: async (data) => {
        const response = await client.post('/expenses', data);
        return response.data;
    },

    getSummary: async (startDate, endDate) => {
        const response = await client.get('/expenses/summary', {
            params: { start_date: startDate, end_date: endDate },
        });
        return response.data;
    },

    getCategories: async () => {
        const response = await client.get('/expenses/categories');
        return response.data;
    },

    createCategory: async (data) => {
        const response = await client.post('/expenses/categories', data);
        return response.data;
    },
};
