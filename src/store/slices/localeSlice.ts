import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type SupportedLocale = 'vi' | 'en';

interface LocaleState {
  currentLocale: SupportedLocale;
}

const getInitialLocale = (): SupportedLocale => {
  const saved = localStorage.getItem('hrm_locale');
  if (saved === 'vi' || saved === 'en') return saved;
  return 'vi';
};

const initialState: LocaleState = {
  currentLocale: getInitialLocale(),
};

export const localeSlice = createSlice({
  name: 'locale',
  initialState,
  reducers: {
    setLocale: (state, action: PayloadAction<SupportedLocale>) => {
      state.currentLocale = action.payload;
      localStorage.setItem('hrm_locale', action.payload);
    },
    toggleLocale: (state) => {
      const next = state.currentLocale === 'vi' ? 'en' : 'vi';
      state.currentLocale = next;
      localStorage.setItem('hrm_locale', next);
    },
  },
});

export const { setLocale, toggleLocale } = localeSlice.actions;
export default localeSlice.reducer;
