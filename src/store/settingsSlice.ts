import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ThemeMode } from '../types';
import { getSettingDb, setSettingDb } from './db';
import { dateUtils } from '../utils/date';

interface SettingsState {
  themeMode: ThemeMode;
  defaultTimezone: string;
}

const initialState: SettingsState = {
  themeMode: 'system',
  defaultTimezone: dateUtils.getDeviceTimezone(),
};

export const loadSettings = createAsyncThunk('settings/loadSettings', async () => {
  const theme = await getSettingDb('theme_mode');
  const tz = await getSettingDb('default_timezone');
  return {
    themeMode: (theme as ThemeMode) ?? 'system',
    defaultTimezone: (tz as string) ?? dateUtils.getDeviceTimezone(),
  };
});

export const saveThemeMode = createAsyncThunk(
  'settings/saveThemeMode',
  async (mode: ThemeMode) => {
    await setSettingDb('theme_mode', mode);
    return mode;
  }
);

export const saveDefaultTimezone = createAsyncThunk(
  'settings/saveDefaultTimezone',
  async (tz: string) => {
    await setSettingDb('default_timezone', tz);
    return tz;
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadSettings.fulfilled, (state, action) => {
      state.themeMode = action.payload.themeMode;
      state.defaultTimezone = action.payload.defaultTimezone;
    });
    builder.addCase(saveThemeMode.fulfilled, (state, action) => {
      state.themeMode = action.payload;
    });
    builder.addCase(saveDefaultTimezone.fulfilled, (state, action) => {
      state.defaultTimezone = action.payload;
    });
  },
});

export default settingsSlice.reducer;
