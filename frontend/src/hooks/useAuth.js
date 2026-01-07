import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authApi from '../api/auth';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: true,

            login: async (email, password) => {
                const response = await authApi.login(email, password);
                if (response.success) {
                    localStorage.setItem('access_token', response.data.access_token);
                    localStorage.setItem('refresh_token', response.data.refresh_token);
                    set({
                        user: response.data.user,
                        isAuthenticated: true,
                    });
                    return response;
                }
                throw new Error(response.message);
            },

            logout: async () => {
                try {
                    await authApi.logout();
                } catch (error) {
                    // Ignore logout errors
                }
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                set({
                    user: null,
                    isAuthenticated: false,
                });
            },

            checkAuth: async () => {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    set({ isLoading: false, isAuthenticated: false, user: null });
                    return;
                }

                try {
                    const response = await authApi.me();
                    if (response.success) {
                        set({
                            user: response.data,
                            isAuthenticated: true,
                            isLoading: false,
                        });
                    } else {
                        throw new Error('Auth check failed');
                    }
                } catch (error) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                }
            },

            hasPermission: (permission) => {
                const user = get().user;
                if (!user?.permissions) return false;
                if (user.permissions.includes('*')) return true;
                return user.permissions.includes(permission);
            },

            hasRole: (roles) => {
                const user = get().user;
                if (!user?.role?.name) return false;
                const roleArray = Array.isArray(roles) ? roles : [roles];
                return roleArray.includes(user.role.name);
            },

            isAdmin: () => {
                const user = get().user;
                return ['OWNER', 'ADMIN'].includes(user?.role?.name);
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
);

export default useAuthStore;
