// /app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/config/prisma";
import { verifyToken, isTokenValid } from "@/utils/token";
import cookie from "cookie";

export async function GET(req: NextRequest) {
  try {
    const cookies = req.headers.get("cookie") || "";
    const parsedCookies = cookie.parse(cookies);
    const token = parsedCookies.admin_session;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Step 1: Verify JWT
    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }

    // Step 2: Fetch admin
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
    });
    if (!admin || !admin.sessionId) {
      return NextResponse.json(
        { message: "Session not found" },
        { status: 401 }
      );
    }

    // Step 3: Validate against DB
    const valid = await isTokenValid(
      token,
      admin.sessionId
    );
    if (!valid) {
      return NextResponse.json(
        { message: "Session expired or invalid" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: admin.id,
      email: admin.email,
      admin: admin.isAdmin,
    });
  } catch (error) {
    console.error("ME error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
