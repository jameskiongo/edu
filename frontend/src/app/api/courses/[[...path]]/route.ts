import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:3003/api";

async function proxyRequest(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  try {
    const { path } = await params;
    const session = await getSession();
    
    // Construct target URL
    // The path variable from the catch-all route already contains the sub-path
    // e.g., if the route is /api/courses/123, path will be ['123']
    const subPath = path ? path.join("/") : "";
    const searchParams = request.nextUrl.search;
    
    // BACKEND_URL typically ends with /api. 
    // The backend course routes are mounted at /api/courses
    const targetUrl = `${BACKEND_URL}/courses${subPath ? `/${subPath}` : ""}${searchParams}`;

    const headers = new Headers();
    if (session.accessToken) {
      headers.set("Authorization", `Bearer ${session.accessToken}`);
    }

    // Forward relevant headers
    const contentType = request.headers.get("content-type");
    if (contentType) {
      headers.set("content-type", contentType);
    }

    // Use request.body directly for streaming (more reliable for multipart)
    const body = request.body;

    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      // @ts-ignore - duplex is required for streaming bodies in some fetch implementations
      duplex: 'half',
    });

    const data = await response.json().catch(() => ({}));
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[Courses Proxy Error]:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
