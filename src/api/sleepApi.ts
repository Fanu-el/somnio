import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { SleepRecord, SleepStats } from '../types';
import { tokenStorage } from '../utils/tokenStorage';

const BASE_URL = process.env.EXPO_PUBLIC_BASE_API_URL ?? 'http://localhost:3000/api/';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: async (headers) => {
    const token = await tokenStorage.getAccessToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

// Auto-refresh token on 401, same pattern as authApi
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args, api, extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401) {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (refreshToken) {
      const refreshResult = await rawBaseQuery(
        { url: 'auth/refresh', method: 'POST', body: { refreshToken } },
        api, extraOptions,
      );
      if (refreshResult.data) {
        const data = refreshResult.data as { data: { accessToken: string; refreshToken: string } };
        await tokenStorage.setTokens(data.data.accessToken, data.data.refreshToken);
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        await tokenStorage.clearTokens();
      }
    } else {
      await tokenStorage.clearTokens();
    }
  }
  return result;
};

export const sleepApi = createApi({
  reducerPath: 'sleepApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Logs'],
  endpoints: (builder) => ({
    getLogs: builder.query<{ data: { logs: SleepRecord[] } }, void>({
      query: () => 'core/sleep',
      providesTags: ['Logs'],
    }),
    syncLogs: builder.mutation<{ data: { syncedCount: number } }, SleepRecord[]>({
      query: (logs) => ({
        url: 'core/sleep/sync',
        method: 'POST',
        body: { logs },
      }),
      invalidatesTags: ['Logs'],
    }),
    deleteLog: builder.mutation<{ data: { message: string } }, string>({
      query: (id) => ({
        url: `core/sleep/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Logs'],
    }),
    getReports: builder.query<{ data: { stats: SleepStats } }, void>({
      query: () => 'core/reports/summary',
      providesTags: ['Logs'],
    }),
  }),
});

export const { 
  useGetLogsQuery, 
  useSyncLogsMutation, 
  useDeleteLogMutation,
  useGetReportsQuery 
} = sleepApi;
