import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();

    const response = await fetch(
      `${process.env.BACKEND_API_URL}/users/profile/image`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: formData,
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false,
          message: data.message || "Failed to upload image",
          error: data.message || "Failed to upload image" 
        },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Image upload proxy error:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "Internal server error",
        error: "Internal server error" 
      },
      { status: 500 },
    );
  }
}
