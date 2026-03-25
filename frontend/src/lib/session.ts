import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { type SessionData, sessionOptions } from "@/types/session/session";

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(
    cookieStore,
    sessionOptions,
  );
  return session;
}

export async function createSession(data: Omit<SessionData, "isLoggedIn">) {
  const session = await getSession();
  session.userId = data.userId;
  session.email = data.email;
  session.isLoggedIn = true;
  session.accessToken = data.accessToken;
  session.refreshToken = data.refreshToken;
  await session.save();
}

export async function updateSessionAccessToken(accessToken: string) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(
    cookieStore,
    sessionOptions,
  );
  session.accessToken = accessToken;
  await session.save();
}

export async function destroySession() {
  const session = await getSession();
  session.destroy();
}
