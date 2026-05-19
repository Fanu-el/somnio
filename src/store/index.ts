import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { sleepApi } from '../api/sleepApi';
import { authApi } from '../api/authApi';
import { SleepRecord } from '../types';
import { getLogs, insertLog, deleteLogDb, updateLogDb, markLogsSyncedDb, upsertLogs } from './db';
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

export const syncFromCloud = createAsyncThunk('sleep/syncFromCloud', async (_, { dispatch }) => {
  const result = await dispatch(sleepApi.endpoints.getLogs.initiate(undefined, { forceRefetch: true }));
  if (result.data?.data?.logs) {
    await upsertLogs(result.data.data.logs);
    return getLogs();
  }
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

export const updateLocalLog = createAsyncThunk(
  'sleep/updateLocalLog',
  async (log: SleepRecord) => {
    await updateLogDb(log);
    return log;
  }
);

export const removeLocalLog = createAsyncThunk('sleep/removeLocalLog', async (id: string, { dispatch }) => {
  // Delete locally first so UI is instant
  await deleteLogDb(id);
  // Best-effort cloud delete — swallow errors so offline still works
  try {
    await dispatch(sleepApi.endpoints.deleteLog.initiate(id)).unwrap();
  } catch (e) {
    console.warn('[removeLocalLog] Cloud delete failed (offline?). Log removed locally only.', e);
  }
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
      .addCase(syncFromCloud.fulfilled, (state, action) => {
        state.logs = action.payload;
        state.isLoading = false;
      })
      .addCase(addLocalLog.fulfilled, (state, action) => {
        state.logs.unshift(action.payload);
      })
      .addCase(updateLocalLog.fulfilled, (state, action) => {
        state.logs = state.logs.map(l => l.id === action.payload.id ? action.payload : l);
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
