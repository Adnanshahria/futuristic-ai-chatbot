import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { COOKIE_NAME } from "@shared/const";
import * as jose from "jose";
import * as db from "../db";
import { userCache } from "./cache";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const token = opts.req.cookies?.[COOKIE_NAME];

    if (token) {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-me");
      const { payload } = await jose.jwtVerify(token, secret);

      if (payload.openId && typeof payload.openId === "string") {
        // Check cache first (fast path)
        const cached = userCache.get(`user:${payload.openId}`);
        if (cached) {
          user = cached as User;
        } else {
          // Fallback to database
          const dbUser = await db.getUserByOpenId(payload.openId);
          if (dbUser) {
            // Cache for future requests
            userCache.set(`user:${payload.openId}`, dbUser as any);
            user = dbUser as User;
          }
        }
      }
    }
  } catch {
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
