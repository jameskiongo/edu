import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST() {
  try {
    const session = await getSession();

    console.log("Refresh attempt:", {
      hasSession: session.isLoggedIn,
      hasRefreshToken: !!session.refreshToken,
      hasAccessToken: !!session.accessToken,
    });

    if (!session.refreshToken) {
      console.log("No refresh token in session");
      return NextResponse.json({ error: "No refresh token" }, { status: 401 });
    }

    console.log("Calling backend refresh...");

    const response = await fetch(
      `${process.env.BACKEND_API_URL}/auth/refresh-token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      },
    );

    console.log("Backend refresh status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log("Backend refresh error:", errorData);

      session.destroy();
      return NextResponse.json({ error: "Refresh failed" }, { status: 401 });
    }

    const data = await response.json();
    console.log("Backend refresh response:", data);

    const responseData = data.data || data;

    if (!responseData.accessToken) {
      console.log("No access token in refresh response");
      return NextResponse.json(
        { error: "Invalid refresh response" },
        { status: 500 },
      );
    }

    // Update session
    session.accessToken = responseData.accessToken;
    if (responseData.refreshToken) {
      session.refreshToken = responseData.refreshToken;
    }
    await session.save();

    console.log("Session updated successfully");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Refresh exception:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
