import { create } from 'zustand';
import api from '../services/api';

const usePropertyStore = create((set, get) => ({
    properties: [],
    property: null,
    isLoading: false,
    error: null,
    filters: {
        status: '',
        type: '',
        minPrice: '',
        maxPrice: '',
        city: ''
    },
    pagination: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0
    },

    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters },
            pagination: { ...state.pagination, page: 1 } // Reset to page 1 on filter change
        }));
        get().fetchProperties();
    },

    setPage: (page) => {
        set((state) => ({
            pagination: { ...state.pagination, page }
        }));
        get().fetchProperties();
    },

    fetchProperties: async () => {
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

            const response = await api.get('/properties', { params });

            set({
                properties: response.data.data,
                pagination: {
                    ...pagination,
                    total: response.data.meta.total,
                    totalPages: response.data.meta.pages
                },
                isLoading: false
            });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch properties',
                isLoading: false
            });
        }
    },

    fetchProperty: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/properties/${id}`);
            set({ property: response.data.data, isLoading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch property details',
                isLoading: false
            });
        }
    },

    createProperty: async (propertyData) => {
        set({ isLoading: true, error: null });
        try {
            await api.post('/properties', propertyData);
            set({ isLoading: false });
            get().fetchProperties(); // Refresh list
            return true;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to create property',
                isLoading: false
            });
            return false;
        }
    },

    updateProperty: async (id, propertyData) => {
        set({ isLoading: true, error: null });
        try {
            await api.put(`/properties/${id}`, propertyData);
            set({ isLoading: false });
            get().fetchProperty(id); // Refresh details
            return true;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to update property',
                isLoading: false
            });
            return false;
        }
    },

    deleteProperty: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/properties/${id}`);
            set({ isLoading: false });
            get().fetchProperties(); // Refresh list
            return true;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to delete property',
                isLoading: false
            });
            return false;
        }
    }
}));

export default usePropertyStore;
