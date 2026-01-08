import { create } from 'zustand';
import api from '../services/api';

const useClientStore = create((set, get) => ({
    clients: [],
    client: null,
    isLoading: false,
    error: null,
    filters: {
        search: '',
        status: '',
        minBudget: '',
        maxBudget: ''
    },
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    },

    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters },
            pagination: { ...state.pagination, page: 1 }
        }));
        get().fetchClients();
    },

    setPage: (page) => {
        set((state) => ({
            pagination: { ...state.pagination, page }
        }));
        get().fetchClients();
    },

    fetchClients: async () => {
        set({ isLoading: true, error: null });
        const { filters, pagination } = get();

        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                ...filters
            };

            // Remove empty filters
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null) {
                    delete params[key];
                }
            });

            const response = await api.get('/clients', { params });

            set({
                clients: response.data.data,
                pagination: {
                    ...pagination,
                    total: response.data.meta.total,
                    totalPages: response.data.meta.pages
                },
                isLoading: false
            });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch clients',
                isLoading: false
            });
        }
    },

    fetchClient: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/clients/${id}`);
            set({ client: response.data.data, isLoading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch client details',
                isLoading: false
            });
        }
    },

    createClient: async (clientData) => {
        set({ isLoading: true, error: null });
        try {
            await api.post('/clients', clientData);
            set({ isLoading: false });
            get().fetchClients();
            return true;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to create client',
                isLoading: false
            });
            return false;
        }
    },

    updateClient: async (id, clientData) => {
        set({ isLoading: true, error: null });
        try {
            await api.put(`/clients/${id}`, clientData);
            set({ isLoading: false });
            get().fetchClient(id);
            return true;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to update client',
                isLoading: false
            });
            return false;
        }
    },

    deleteClient: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/clients/${id}`);
            set({ isLoading: false });
            get().fetchClients();
            return true;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to delete client',
                isLoading: false
            });
            return false;
        }
    }
}));

export default useClientStore;
