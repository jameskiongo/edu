import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const targetUrl = `${process.env.BACKEND_API_URL}/users`;
    console.log(`[Proxy] GET ${targetUrl}`);

    if (!session.accessToken) {
      console.error("[Proxy] No access token in session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(
      targetUrl,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Cache-Control": "no-cache",
        },
      },
    );

    console.log(`[Proxy] Backend returned ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch users" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Fetch users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
