import { prisma } from "@/config/prisma";
import { verifyToken } from "@/utils/token";
import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";

export function adminAuth(
  handler: (
    req: NextApiRequest,
    res: NextApiResponse
  ) => any
) {
  return async (
    req: NextApiRequest,
    res: NextApiResponse
  ) => {
    try {
      const token = req.cookies.admin_session;
      if (!token) {
        return res.status(401).json({
          status: "fail",
          message: "No authentication token",
        });
      }

      const decoded: any = verifyToken(token);
      if (!decoded?.id) {
        return res.status(403).json({
          status: "fail",
          message: "Invalid token",
        });
      }

      const admin = await prisma.admin.findUnique({
        where: { id: decoded.id },
      });
      if (!admin)
        return res.status(403).json({
          status: "fail",
          message: "Admin not found",
        });

      const valid = await bcrypt.compare(
        token,
        admin.sessionId as string
      );
      if (!valid)
        return res.status(401).json({
          status: "fail",
          message:
            "Session invalid or logged in from another device",
        });

      // Attach admin to req
      (req as any).admin = admin;

      return handler(req, res);
    } catch (error) {
      console.error("Admin auth error:", error);
      return res.status(500).json({
        status: "fail",
        message: "Internal server error",
      });
    }
  };
}
