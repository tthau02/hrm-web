import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from '@/types';

// Read initial state from localStorage if available
const storedToken = localStorage.getItem('sasco_token');
const storedUser = localStorage.getItem('sasco_user');

const initialUser: User | null = storedUser ? JSON.parse(storedUser) : {
  id: 'usr-1',
  name: 'Quản trị hệ thống',
  email: 'admin@sasco.vn',
  role: 'admin',
  department: 'Ban Quản trị',
};

const initialState: AuthState = {
  user: initialUser,
  token: storedToken || 'mock-admin-token-12345',
  isAuthenticated: true, // Default to true for instant demo exploration
  loading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem('sasco_token', action.payload.token);
      localStorage.setItem('sasco_user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('sasco_token');
      localStorage.removeItem('sasco_user');
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setCredentials, logout, setAuthLoading, setAuthError } =
  authSlice.actions;

export default authSlice.reducer;
