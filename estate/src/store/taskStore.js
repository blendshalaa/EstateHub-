import { create } from 'zustand';
import api from '../services/api';

const useTaskStore = create((set, get) => ({
    tasks: [],
    isLoading: false,
    error: null,

    fetchTasks: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/tasks');
            set({ tasks: response.data.data, isLoading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch tasks',
                isLoading: false
            });
        }
    },

    createTask: async (data) => {
        set({ isLoading: true, error: null });
        try {
            await api.post('/tasks', data);
            set({ isLoading: false });
            get().fetchTasks();
            return true;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to create task',
                isLoading: false
            });
            return false;
        }
    },

    completeTask: async (id) => {
        // Optimistic update
        set((state) => ({
            tasks: state.tasks.map(task =>
                task.id === id ? { ...task, status: 'completed' } : task
            )
        }));

        try {
            await api.put(`/tasks/${id}/complete`);
            return true;
        } catch (error) {
            get().fetchTasks(); // Revert on error
            return false;
        }
    }
}));

export default useTaskStore;
