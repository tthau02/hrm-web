import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface ThemeState {
  isDarkMode: boolean;
  collapsedSidebar: boolean;
  primaryColor: string;
}

const getInitialDarkMode = (): boolean => {
  try {
    return localStorage.getItem('sasco_dark_mode') === 'true';
  } catch {
    return false;
  }
};

const initialState: ThemeState = {
  isDarkMode: getInitialDarkMode(),
  collapsedSidebar: false,
  primaryColor: '#0064e0', // SASCO Blue from DESIGN.md
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
    toggleSidebar: (state) => {
      state.collapsedSidebar = !state.collapsedSidebar;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.collapsedSidebar = action.payload;
    },
    setPrimaryColor: (state, action: PayloadAction<string>) => {
      state.primaryColor = action.payload;
    },
  },
});

export const {
  toggleTheme,
  setDarkMode,
  toggleSidebar,
  setSidebarCollapsed,
  setPrimaryColor,
} = themeSlice.actions;

export default themeSlice.reducer;
