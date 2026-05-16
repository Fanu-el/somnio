import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ThemeMode } from '../types';
import { getSettingDb, setSettingDb } from './db';

interface SettingsState {
  themeMode: ThemeMode;
}

const initialState: SettingsState = {
  themeMode: 'system',
};

export const loadThemeMode = createAsyncThunk('settings/loadThemeMode', async () => {
  const value = await getSettingDb('theme_mode');
  return (value as ThemeMode) ?? 'system';
});

export const saveThemeMode = createAsyncThunk(
  'settings/saveThemeMode',
  async (mode: ThemeMode) => {
    await setSettingDb('theme_mode', mode);
    return mode;
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadThemeMode.fulfilled, (state, action) => {
      state.themeMode = action.payload;
    });
    builder.addCase(saveThemeMode.fulfilled, (state, action) => {
      state.themeMode = action.payload;
    });
  },
});

export default settingsSlice.reducer;
