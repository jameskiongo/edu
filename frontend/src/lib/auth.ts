import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  TokensResponse,
} from "@/types/auth/auth";

const API_URL = "/api";

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const isAuthEndpoint = originalRequest.url?.includes("/auth/");
      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post("/api/auth/refresh-token");
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        window.location.href = "/login?message=session_expired";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<{
      success: boolean;
      message: string;
      data: LoginResponse;
    }>("/auth/login", data),
  verifyLogin: (data: { userId: number; code: string }) =>
    api.post<{
      success: boolean;
      message: string;
      data: TokensResponse;
    }>("/auth/verify-login", data),
  register: (data: RegisterRequest) =>
    api.post<{
      success: boolean;
      message: string;
      data: RegisterResponse;
    }>("/auth/register", data),

  verifyRegistration: (data: { userId: number; code: string }) =>
    api.post<{
      success: boolean;
      message: string;
    }>("/auth/verify-registration", data),
  resendLoginOTP: (data: { userId: number; purpose: string }) =>
    api.post<{
      success: boolean;
      message: string;
      data: {
        success: boolean;
        message: string;
        deliveryMethod: "sms" | "email";
        isBlacklisted?: boolean;
      };
    }>("/auth/resend-login-otp", data),

  resendRegisterOTP: (data: { userId: number; purpose: string }) =>
    api.post<{
      success: boolean;
      message: string;
      data: {
        success: boolean;
        message: string;
        deliveryMethod: "sms" | "email";
        isBlacklisted?: boolean;
      };
    }>("/auth/resend-register-otp", data),

  resendPasswordChangeOTP: (data: { userId: number; purpose: string }) =>
    api.post<{
      success: boolean;
      message: string;
    }>("/auth/resend-password-change-otp", data),

  forgotPassword: (data: { email: string }) =>
    api.post<{
      success: boolean;
      message: string;
    }>("/auth/forgot-password", data),

  resetPassword: (data: { email: string; code: string; newPassword: string }) =>
    api.post<{
      success: boolean;
      message: string;
    }>("/auth/reset-password", data),

  requestPasswordChange: (data: {
    email: string;
    currentPassword?: string;
    newPassword?: string;
  }) =>
    api.post<{
      success: boolean;
      message: string;
      data: { email: string; deliveryMethod: string };
    }>("/auth/request-password-change", data),

  verifyPasswordChange: (data: {
    email: string;
    code: string;
    newPassword?: string;
  }) =>
    api.post<{
      success: boolean;
      message: string;
    }>("/auth/verify-password-change", data),

  logout: () => api.post<{ success: boolean }>("/auth/logout"),
};
export const userApi = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    image?: string;
    defaultSmsDelivery?: boolean;
  }) => api.patch("/users/profile", data),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post("/users/profile/image", formData);
  },
  updateTeacherProfile: (data: {
    bio?: string;
    specialization?: string;
    yearsOfExperience?: number;
  }) => api.patch("/users/profile/teacher", data),
  updateStudentProfile: (data: Record<string, any>) =>
    api.patch("/users/profile/student", data),
  requestPhoneChange: (data: { phoneNumber: string }) =>
    api.post("/users/profile/phone-change", data),
  verifyPhoneChange: (data: { phoneNumber: string; code: string }) =>
    api.post("/users/profile/verify-phone-change", data),
};
