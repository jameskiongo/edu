export interface SessionData {
  userId?: number;
  email?: string;
  isLoggedIn: boolean;
  accessToken?: string;
  refreshToken?: string;
}

export const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "app-session",
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  },
};
