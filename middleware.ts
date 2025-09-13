// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define allowed origins
const allowedOrigins = ["http://localhost:3000"];

export function middleware(request: NextRequest) {
  // Get the origin from the request headers
  const origin = request.headers.get("origin");

  // Handle preflight OPTIONS request
  if (request.method === "OPTIONS") {
    // Check if the origin is allowed
    if (origin && allowedOrigins.includes(origin)) {
      const headers = new Headers();
      headers.set("Access-Control-Allow-Origin", origin);
      headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
      headers.set(
        "Access-Control-Allow-Credentials",
        "true"
      );
      headers.set("Access-Control-Max-Age", "86400"); // 24 hours
      return new NextResponse(null, {
        status: 204,
        headers,
      });
    }
    // If origin is not allowed, return a simple response
    return new NextResponse(null, { status: 204 });
  }

  // Handle main request
  const response = NextResponse.next();

  // Check if the origin is allowed and add CORS headers to the response
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set(
      "Access-Control-Allow-Origin",
      origin
    );
    response.headers.set(
      "Access-Control-Allow-Credentials",
      "true"
    );
  }

  return response;
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: "/api/:path*", // Apply CORS to all routes under /api/
};
