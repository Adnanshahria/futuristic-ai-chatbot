/**
 * Rate Limiting Middleware
 * Protects API from abuse and ensures fair usage for all users.
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

class RateLimiter {
    private limits: Map<string, RateLimitEntry> = new Map();
    private readonly maxRequests: number;
    private readonly windowMs: number;

    constructor(maxRequests: number = 100, windowSeconds: number = 60) {
        this.maxRequests = maxRequests;
        this.windowMs = windowSeconds * 1000;

        // Cleanup old entries every minute
        setInterval(() => this.cleanup(), 60000);
    }

    isAllowed(key: string): { allowed: boolean; remaining: number; resetIn: number } {
        const now = Date.now();
        const entry = this.limits.get(key);

        if (!entry || now > entry.resetTime) {
            // New window
            this.limits.set(key, { count: 1, resetTime: now + this.windowMs });
            return { allowed: true, remaining: this.maxRequests - 1, resetIn: this.windowMs };
        }

        if (entry.count >= this.maxRequests) {
            return { allowed: false, remaining: 0, resetIn: entry.resetTime - now };
        }

        entry.count++;
        return { allowed: true, remaining: this.maxRequests - entry.count, resetIn: entry.resetTime - now };
    }

    private cleanup(): void {
        const now = Date.now();
        const entries = Array.from(this.limits.entries());
        for (const [key, entry] of entries) {
            if (now > entry.resetTime) {
                this.limits.delete(key);
            }
        }
    }
}

// API rate limiter: 100 requests/minute/user
export const apiLimiter = new RateLimiter(100, 60);

// Gemini API rate limiter: 10 requests/minute/user (expensive)
export const geminiLimiter = new RateLimiter(10, 60);

// Auth rate limiter: 10 attempts/minute/IP (brute force protection)
export const authLimiter = new RateLimiter(10, 60);

/**
 * Get rate limit key from request
 */
export function getRateLimitKey(userId?: number, ip?: string): string {
    return userId ? `user:${userId}` : `ip:${ip || "unknown"}`;
}

console.log("[RateLimit] Rate limiting initialized");
