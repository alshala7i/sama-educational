import { create } from 'zustand';
import { User } from '@/types';
import api from '@/lib/api';
import { setToken, removeToken, getToken, getUser, setUser } from '@/lib/auth';

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => Promise<void>;
}

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, user } = response.data;

      setToken(accessToken);
      setUser(user);

      set({ token: accessToken, user, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    removeToken();
    set({ user: null, token: null });
  },

  hydrate: async () => {
    const token = getToken();
    const user = getUser();

    if (token && user) {
      set({ token, user });
    }
  },
}));
