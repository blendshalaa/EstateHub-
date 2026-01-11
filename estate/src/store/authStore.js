import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    agent: JSON.parse(localStorage.getItem('agent')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/auth/login', { email, password });
            const { user, agent, token } = response.data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            if (agent) localStorage.setItem('agent', JSON.stringify(agent));

            set({
                user,
                agent,
                token,
                isAuthenticated: true,
                isLoading: false
            });
            return true;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Login failed',
                isLoading: false
            });
            return false;
        }
    },

    register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/auth/register', userData);
            const { user, agent, token } = response.data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            if (agent) localStorage.setItem('agent', JSON.stringify(agent));

            set({
                user,
                agent,
                token,
                isAuthenticated: true,
                isLoading: false
            });
            return true;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Registration failed',
                isLoading: false
            });
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('agent');
        set({
            user: null,
            agent: null,
            token: null,
            isAuthenticated: false
        });
    },

    updateProfile: async (userData) => {
        set({ isLoading: true, error: null });
        try {
            // Implementation for profile update
            // const response = await api.put('/users/profile', userData);
            // set({ user: response.data.data, isLoading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Update failed',
                isLoading: false
            });
        }
    }
}));

export default useAuthStore;
