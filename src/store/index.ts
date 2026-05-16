import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { sleepApi } from '../api/sleepApi';
import { authApi } from '../api/authApi';
import { SleepRecord } from '../types';
import { getLogs, insertLog, deleteLogDb, markLogsSyncedDb } from './db';
import settingsReducer from './settingsSlice';
import authReducer from './authSlice';

// ── Sleep slice ─────────────────────────────────────────────────
interface SleepState {
  logs: SleepRecord[];
  isLoading: boolean;
}

const initialState: SleepState = { logs: [], isLoading: true };

export const fetchLocalLogs = createAsyncThunk('sleep/fetchLocalLogs', async () => {
  return getLogs();
});

export const addLocalLog = createAsyncThunk(
  'sleep/addLocalLog',
  async (logData: Omit<SleepRecord, 'id' | 'synced'>) => {
    const newLog: SleepRecord = {
      ...logData,
      id: Math.random().toString(36).substring(2, 9),
      synced: false,
    };
    await insertLog(newLog);
    return newLog;
  }
);

export const removeLocalLog = createAsyncThunk('sleep/removeLocalLog', async (id: string) => {
  await deleteLogDb(id);
  return id;
});

export const markSynced = createAsyncThunk('sleep/markSynced', async (ids: string[]) => {
  await markLogsSyncedDb(ids);
  return ids;
});

const sleepSlice = createSlice({
  name: 'sleep',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocalLogs.pending, (state) => { state.isLoading = true; })
      .addCase(fetchLocalLogs.fulfilled, (state, action) => {
        state.logs = action.payload;
        state.isLoading = false;
      })
      .addCase(addLocalLog.fulfilled, (state, action) => {
        state.logs.unshift(action.payload);
      })
      .addCase(removeLocalLog.fulfilled, (state, action) => {
        state.logs = state.logs.filter(l => l.id !== action.payload);
      })
      .addCase(markSynced.fulfilled, (state, action) => {
        state.logs = state.logs.map(l =>
          action.payload.includes(l.id) ? { ...l, synced: true } : l
        );
      });
  },
});

// ── Store ───────────────────────────────────────────────────────
export const store = configureStore({
  reducer: {
    sleep: sleepSlice.reducer,
    settings: settingsReducer,
    auth: authReducer,
    [sleepApi.reducerPath]: sleepApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sleepApi.middleware, authApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
