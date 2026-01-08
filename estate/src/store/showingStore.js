import { create } from 'zustand';
import api from '../services/api';

const useShowingStore = create((set, get) => ({
    showings: [],
    upcomingShowings: [],
    isLoading: false,
    error: null,
    filters: {
        status: '',
        date: ''
    },

    fetchShowings: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/showings');
            set({ showings: response.data.data, isLoading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch showings',
                isLoading: false
            });
        }
    },

    fetchUpcomingShowings: async () => {
        try {
            const response = await api.get('/showings/upcoming');
            set({ upcomingShowings: response.data.data });
        } catch (error) {
            console.error('Failed to fetch upcoming showings', error);
        }
    },

    createShowing: async (showingData) => {
        set({ isLoading: true, error: null });
        try {
            await api.post('/showings', showingData);
            set({ isLoading: false });
            get().fetchShowings();
            return true;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to create showing',
                isLoading: false
            });
            return false;
        }
    },

    cancelShowing: async (id, reason) => {
        set({ isLoading: true, error: null });
        try {
            await api.put(`/showings/${id}/cancel`, { cancellation_reason: reason });
            set({ isLoading: false });
            get().fetchShowings();
            return true;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to cancel showing',
                isLoading: false
            });
            return false;
        }
    }
}));

export default useShowingStore;
