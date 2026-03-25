import axios from "axios";
import type {
  LoginResponse,
  RegisterResponse,
  TokensResponse,
} from "@/types/auth/auth";

const API_URL = "/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
export const authApi = {
  login: (data: { email: string; password: string }) =>
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
  register: (data: {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
  }) =>
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
};
