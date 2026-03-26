export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  image: string | null;
  phoneNumber: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginApiResponse {
  success: boolean;
  message: string;
  data: {
    userId: number;
    message: string;
    requiresOTP: boolean;
    deliveryMethod?: "sms" | "email";
  };
}
export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  userId: number;
  message: string;
  requiresOTP: boolean;
}
export interface ErrorResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ApiError {
  error: string;
  details?: Array<{ field: string; message: string }>;
}

export interface RegisterResponse {
  userId: number;
  deliveryMethod?: "sms" | "email";
}
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
}
export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokensResponse {
  accessToken: string;
  refreshToken: string;
}
