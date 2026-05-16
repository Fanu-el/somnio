import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ApiUser } from '../types/auth';
import { authApi } from '../api/authApi';

interface AuthState {
  user: ApiUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean; // true while we check stored tokens on app start
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isInitializing: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<ApiUser>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isInitializing = false;
    },
    clearAuth(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.isInitializing = false;
    },
    setInitializing(state, action: PayloadAction<boolean>) {
      state.isInitializing = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login success → set user
    builder.addMatcher(authApi.endpoints.login.matchFulfilled, (state, { payload }) => {
      state.user = payload.data.user;
      state.isAuthenticated = true;
      state.isInitializing = false;
    });

    // Logout / delete account → clear everything
    builder.addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
    });
    builder.addMatcher(authApi.endpoints.deleteAccount.matchFulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
    });

    // getMe success → sync user
    builder.addMatcher(authApi.endpoints.getMe.matchFulfilled, (state, { payload }) => {
      state.user = payload.data.user;
      state.isAuthenticated = true;
      state.isInitializing = false;
    });
    builder.addMatcher(authApi.endpoints.getMe.matchRejected, (state) => {
      state.isInitializing = false;
    });

    // Profile update → sync user
    builder.addMatcher(authApi.endpoints.updateProfile.matchFulfilled, (state, { payload }) => {
      state.user = payload.data.user;
    });
    builder.addMatcher(authApi.endpoints.updateProfilePicture.matchFulfilled, (state, { payload }) => {
      state.user = payload.data.user;
    });
  },
});

export const { setUser, clearAuth, setInitializing } = authSlice.actions;
export default authSlice.reducer;
