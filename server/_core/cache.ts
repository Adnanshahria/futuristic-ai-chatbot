/**
 * In-memory LRU Cache for high-performance user data caching.
 * Reduces database calls and speeds up authentication checks.
 */

interface CacheEntry<T> {
    value: T;
    expiry: number;
}

class LRUCache<T> {
    private cache: Map<string, CacheEntry<T>> = new Map();
    private readonly maxSize: number;
    private readonly defaultTTL: number;

    constructor(maxSize: number = 10000, defaultTTLSeconds: number = 300) {
        this.maxSize = maxSize;
        this.defaultTTL = defaultTTLSeconds * 1000;
    }

    get(key: string): T | undefined {
        const entry = this.cache.get(key);
        if (!entry) return undefined;

        // Check expiry
        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            return undefined;
        }

        // Move to end (most recently used)
        this.cache.delete(key);
        this.cache.set(key, entry);
        return entry.value;
    }

    set(key: string, value: T, ttlSeconds?: number): void {
        // Remove oldest if at capacity
        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey) this.cache.delete(oldestKey);
        }

        this.cache.set(key, {
            value,
            expiry: Date.now() + (ttlSeconds ? ttlSeconds * 1000 : this.defaultTTL),
        });
    }

    delete(key: string): boolean {
        return this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    get size(): number {
        return this.cache.size;
    }
}

// User session cache (5 minute TTL, 10K users max)
export const userCache = new LRUCache<{
    id: number;
    openId: string;
    email: string;
    name: string;
    role: string;
}>(10000, 300);

// User settings cache (10 minute TTL)
export const settingsCache = new LRUCache<{
    temperature: number;
    maxOutputTokens: number;
    systemPrompt?: string;
    theme?: string;
}>(10000, 600);

// Conversation list cache (2 minute TTL)
export const conversationCache = new LRUCache<Array<{
    id: number;
    title: string;
    updatedAt: Date;
}>>(10000, 120);

// Helper to invalidate user-related caches
export function invalidateUserCaches(userId: number): void {
    settingsCache.delete(`settings:${userId}`);
    conversationCache.delete(`conversations:${userId}`);
}

console.log("[Cache] LRU Cache initialized for 10K+ users");
