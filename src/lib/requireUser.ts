import { NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function requireUser(req: NextRequest): Promise<{ uid: string }> {
  const authHeader = req.headers.get("authorization") || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1];

  if (!token) {
    throw new Response(JSON.stringify({ error: "Missing Authorization bearer token" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const decoded = await adminAuth().verifyIdToken(token);
    return { uid: decoded.uid };
  } catch {
    throw new Response(JSON.stringify({ error: "Invalid or expired token" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
}
