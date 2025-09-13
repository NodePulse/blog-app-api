// app/api/admin/logout/route.ts
import { NextResponse } from "next/server";
import cookie from "cookie";
import { prisma } from "@/config/prisma";
import { isTokenValid } from "@/utils/token";

export async function POST(req: Request) {
  try {
    const res = NextResponse.next();
    const cookies = req.headers.get("cookie") || "";
    const parsedCookies = cookie.parse(cookies);
    const token = parsedCookies.admin_session;

    if (!token) {
      return NextResponse.json(
        {
          status: "fail",
          message: "No active session found!",
        },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findFirst(); // single admin

    if (!admin || !admin.sessionId) {
      return NextResponse.json(
        { status: "fail", message: "Invalid session!" },
        { status: 400 }
      );
    }

    const valid = await isTokenValid(
      token,
      admin.sessionId
    );

    if (!valid) {
      return NextResponse.json(
        {
          status: "fail",
          message:
            "Your session is invalid or has been logged in from another device",
        },
        { status: 400 }
      );
    }

    // Invalidate session
    await prisma.admin.update({
      where: { id: admin.id },
      data: { sessionId: null },
    });

    // Clear cookie
    const response = NextResponse.json({
      status: "success",
      message: "Admin logged out successfully",
    });

    response.headers.set(
      "Set-Cookie",
      cookie.serialize("admin_session", "", {
        httpOnly: true,
        secure: false,
        // secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        path: "/",
        maxAge: 0, // expire immediately
      })
    );

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { status: "fail", message: "Internal server error" },
      { status: 500 }
    );
  }
}
