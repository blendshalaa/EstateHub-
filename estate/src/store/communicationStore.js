import { create } from 'zustand';
import api from '../services/api';

const useCommunicationStore = create((set, get) => ({
    communications: [],
    isLoading: false,
    error: null,

    fetchCommunications: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/communications');
            set({ communications: response.data.data, isLoading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch communications',
                isLoading: false
            });
        }
    },

    logCommunication: async (data) => {
        set({ isLoading: true, error: null });
        try {
            await api.post('/communications', data);
            set({ isLoading: false });
            get().fetchCommunications();
            return true;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to log communication',
                isLoading: false
            });
            return false;
        }
    }
}));

export default useCommunicationStore;
