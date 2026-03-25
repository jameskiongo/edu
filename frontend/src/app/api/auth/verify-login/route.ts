import { type NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/session";
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/auth/verify-login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    const responseData = data.data || data;

    const userId = responseData.userId;
    const accessToken = responseData.accessToken;
    const refreshToken = responseData.refreshToken;

    if (!userId || !accessToken || !refreshToken) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 500 },
      );
    }

    await createSession({
      userId,
      accessToken,
      refreshToken,
    });

    return NextResponse.json({
      success: true,
      message: "Login successful",
      data: { userId },
    });
  } catch (error) {
    console.error("Verify login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
