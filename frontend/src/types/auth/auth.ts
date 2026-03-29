export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  image: string | null;
  phoneNumber: string;
  isVerified: boolean;
  isActive: boolean;
  isBlacklisted: boolean;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  defaultSmsDelivery: boolean;
  teacherProfile?: {
    bio?: string;
    specialization?: string;
    yearsOfExperience?: number;
    rating?: number;
    totalReviews?: number;
    totalStudents?: number;
    website?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  studentProfile?: {
    enrolledCoursesCount?: number;
    completedCourses?: number;
    badges?: Array<{
      id: number;
      badgeType: string;
      earnedAt: string;
    }>;
  };
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
  role?: "STUDENT" | "TEACHER";
}
export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokensResponse {
  accessToken: string;
  refreshToken: string;
}
