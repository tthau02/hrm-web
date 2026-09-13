import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface ThemeState {
  isDarkMode: boolean;
  collapsedSidebar: boolean;
  primaryColor: string;
}

const initialState: ThemeState = {
  isDarkMode: false,
  collapsedSidebar: false,
  primaryColor: '#f54e00', // Cursor Orange from DESIGN.md
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
