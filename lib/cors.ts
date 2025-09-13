// backend/lib/cors.ts
import Cors from "cors";

// Initialize CORS middleware
const cors = Cors({
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  origin: "http://localhost:3000", // Replace with your frontend URL
  credentials: true, // allow cookies if needed
});

// Helper to run middleware in Next.js API route
export function runCors(req: any, res: any) {
  return new Promise((resolve, reject) => {
    cors(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}
