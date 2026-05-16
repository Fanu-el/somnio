import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { SleepRecord } from '../types';

export const sleepApi = createApi({
  reducerPath: 'sleepApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }), // Placeholder baseUrl
  endpoints: (builder) => ({
    syncLogs: builder.mutation<boolean, SleepRecord[]>({
      queryFn: async (logs) => {
        // Mock API call
        return new Promise((resolve) => {
          setTimeout(() => {
            console.log(`[API] Successfully synced ${logs.length} logs to the cloud.`);
            resolve({ data: true });
          }, 1500);
        });
      },
    }),
  }),
});

export const { useSyncLogsMutation } = sleepApi;
