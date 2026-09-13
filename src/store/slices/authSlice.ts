import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from '@/types';

// Read initial state from localStorage if available
const storedToken = localStorage.getItem('hrm_token');
const storedUser = localStorage.getItem('hrm_user');

const initialUser: User | null = storedUser ? JSON.parse(storedUser) : {
  id: 'usr-1',
  name: 'Nguyễn Văn Quản Trị',
  email: 'admin@hrm.vn',
  role: 'admin',
  department: 'Ban Giám Đốc',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
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
      localStorage.setItem('hrm_token', action.payload.token);
      localStorage.setItem('hrm_user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('hrm_token');
      localStorage.removeItem('hrm_user');
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
