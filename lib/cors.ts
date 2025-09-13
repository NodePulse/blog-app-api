// lib/cors-app.ts
import Cors from "cors";

// Initialize CORS middleware for App Router
export const cors = Cors({
  origin: "https://your-frontend-domain.vercel.app", // replace
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
});

// Helper for App Router
export function runCors(req: Request) {
  return new Promise<void>((resolve, reject) => {
    // Convert Request to Next.js-like req/res
    cors(
      // @ts-ignore
      { headers: req.headers },
      {
        // @ts-ignore
        setHeader: (name: string, value: string) => {},
      },
      (result: unknown) => {
        if (result instanceof Error) return reject(result);
        return resolve();
      }
    );
  });
}
