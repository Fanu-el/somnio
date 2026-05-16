import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { tokenStorage } from '../utils/tokenStorage';
import type {
  ApiUser, AuthTokens, RegisterBody, LoginBody, VerifyEmailBody,
  ForgotPasswordBody, ResetPasswordBody, UpdateProfileBody,
} from '../types/auth';

const BASE_URL = process.env.EXPO_PUBLIC_BASE_API_URL ?? 'http://localhost:3000/api/';

if (__DEV__) {
  console.log('[authApi] BASE_URL =', BASE_URL);
}

// ── Base query with auth header ─────────────────────────────────────────────

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: async (headers) => {
    const token = await tokenStorage.getAccessToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

// ── Re-auth base query: auto-refresh on 401 ─────────────────────────────────

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    // Try to refresh
    const refreshToken = await tokenStorage.getRefreshToken();
    if (refreshToken) {
      const refreshResult = await rawBaseQuery(
        { url: 'auth/refresh', method: 'POST', body: { refreshToken } },
        api,
        extraOptions,
      );
      if (refreshResult.data) {
        const data = refreshResult.data as { data: AuthTokens };
        await tokenStorage.setTokens(data.data.accessToken, data.data.refreshToken);
        // Retry original request with new token
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

// ── API ─────────────────────────────────────────────────────────────────────

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Me'],
  endpoints: (builder) => ({

    // ── Auth ────────────────────────────────────────────────────────────────

    register: builder.mutation<{ data: { message: string; user: Pick<ApiUser, 'email' | 'firstName' | 'lastName'> } }, RegisterBody>({
      query: (body) => ({ url: 'auth/register', method: 'POST', body }),
    }),

    verifyEmail: builder.mutation<{ data: { message: string } }, VerifyEmailBody>({
      query: (body) => ({ url: 'auth/verify-email', method: 'POST', body }),
    }),

    resendVerification: builder.mutation<{ data: { message: string } }, { email: string }>({
      query: (body) => ({ url: 'auth/resend-verification', method: 'POST', body }),
    }),

    login: builder.mutation<{ data: AuthTokens & { user: ApiUser } }, LoginBody>({
      query: (body) => ({ url: 'auth/login', method: 'POST', body }),
      invalidatesTags: ['Me'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.data.user.role !== 'SUPER_ADMIN') {
            await tokenStorage.setTokens(data.data.accessToken, data.data.refreshToken);
          }
        } catch {}
      },
    }),

    logout: builder.mutation<{ data: { message: string } }, void>({
      query: () => ({ url: 'auth/logout', method: 'POST' }),
      invalidatesTags: ['Me'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          await tokenStorage.clearTokens();
        } catch {}
      },
    }),

    getMe: builder.query<{ data: { user: ApiUser } }, void>({
      query: () => 'auth/me',
      providesTags: ['Me'],
    }),

    forgotPassword: builder.mutation<{ data: { message: string } }, ForgotPasswordBody>({
      query: (body) => ({ url: 'auth/forgot-password', method: 'POST', body }),
    }),

    resetPassword: builder.mutation<{ data: { message: string } }, ResetPasswordBody>({
      query: (body) => ({ url: 'auth/reset-password', method: 'POST', body }),
    }),

    // ── Profile ─────────────────────────────────────────────────────────────

    updateProfile: builder.mutation<{ data: { user: ApiUser } }, UpdateProfileBody>({
      query: (body) => ({ url: 'users/update-profile', method: 'PATCH', body }),
      invalidatesTags: ['Me'],
    }),

    updateProfilePicture: builder.mutation<{ data: { user: ApiUser } }, FormData>({
      query: (body) => ({
        url: 'users/update-profile-picture',
        method: 'PATCH',
        body,
        // Let fetch set multipart/form-data boundary automatically
        formData: true,
      }),
      invalidatesTags: ['Me'],
    }),

    deleteAccount: builder.mutation<{ data: { message: string } }, { password: string }>({
      query: (body) => ({ url: 'users/delete-account', method: 'DELETE', body }),
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          await tokenStorage.clearTokens();
        } catch {}
      },
    }),
  }),
});

export const {
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useUpdateProfileMutation,
  useUpdateProfilePictureMutation,
  useDeleteAccountMutation,
} = authApi;
