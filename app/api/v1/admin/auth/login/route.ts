// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import cookie from "cookie";
import { prisma } from "@/config/prisma";
import {
  generateSessionToken,
  hashToken,
} from "@/utils/token";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          status: "fail",
          message: "Email and password are required",
          success: false,
        },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { email },
    });
    if (!admin) {
      return NextResponse.json(
        {
          status: "fail",
          message: "Unauthorized access!",
          success: false,
        },
        { status: 401 }
      );
    }

    const validPassword = await bcrypt.compare(
      password,
      admin.password
    );
    if (!validPassword) {
      return NextResponse.json(
        {
          status: "fail",
          message: "Invalid credentials",
          success: false,
        },
        { status: 401 }
      );
    }

    const token = generateSessionToken(admin.id);
    const hashedToken = await hashToken(token);

    const updatedAdmin = await prisma.admin.update({
      where: { id: admin.id },
      data: { sessionId: hashedToken },
    });

    const { password: _, ...safeAdmin } = updatedAdmin;

    // Set HTTP-only cookie
    const response = NextResponse.json(
      {
        status: "success",
        message: "Admin login successful",
        data: safeAdmin,
        success: true,
      },
      { status: 200 }
    );

    response.headers.set(
      "Set-Cookie",
      cookie.serialize("admin_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 1 * 60 * 60, // 1 hours in seconds
        path: "/",
      })
    );

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Internal server error",
        success: false,
      },
      { status: 500 }
    );
  }
}
