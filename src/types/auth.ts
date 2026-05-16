// API User type matching the Prisma schema (password & refreshToken stripped server-side)
export interface ApiUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'DREAMER' | 'SUPER_ADMIN';
  status: 'PENDING' | 'ACTIVE' | 'BANNED' | 'DELETED' | 'TEMPORARILY_LOGIN_DISABLED';
  profilePictureFileId: string | null;
  profilePictureFile: { id: string; path: string; mimeType: string; size: number } | null;
  joinDetails: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ── Request bodies ──────────────────────────────────────────────────────────

export interface RegisterBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface VerifyEmailBody {
  email: string;
  code: string;
}

export interface ForgotPasswordBody {
  email: string;
}

export interface ResetPasswordBody {
  email: string;
  code: string;
  newPassword: string;
}

export interface UpdateProfileBody {
  firstName?: string;
  lastName?: string;
}
