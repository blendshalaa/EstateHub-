import { create } from 'zustand';
import api from '../services/api';

const useDealStore = create((set, get) => ({
    deals: [],
    deal: null,
    isLoading: false,
    error: null,
    filters: {
        agent_id: '',
        minAmount: '',
        maxAmount: ''
    },

    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters }
        }));
        get().fetchDeals();
    },

    fetchDeals: async () => {
        set({ isLoading: true, error: null });
        const { filters } = get();

        try {
            const params = { ...filters };
            // Remove empty filters
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null) {
                    delete params[key];
                }
            });

            const response = await api.get('/deals', { params });
            set({ deals: response.data.data, isLoading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch deals',
                isLoading: false
            });
        }
    },

    fetchDeal: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/deals/${id}`);
            set({ deal: response.data.data, isLoading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch deal details',
                isLoading: false
            });
        }
    },

    createDeal: async (dealData) => {
        set({ isLoading: true, error: null });
        try {
            await api.post('/deals', dealData);
            set({ isLoading: false });
            get().fetchDeals();
            return true;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to create deal',
                isLoading: false
            });
            return false;
        }
    },

    updateDealStage: async (id, stage) => {
        // Optimistic update
        const previousDeals = get().deals;
        set((state) => ({
            deals: state.deals.map(deal =>
                deal.id === id ? { ...deal, stage } : deal
            )
        }));

        try {
            await api.put(`/deals/${id}/stage`, { stage });
            return true;
        } catch (error) {
            // Revert on failure
            set({ deals: previousDeals });
            set({
                error: error.response?.data?.message || 'Failed to update deal stage'
            });
            return false;
        }
    }
}));

export default useDealStore;
