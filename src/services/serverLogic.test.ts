import { describe, it, expect, beforeEach, vi } from 'vitest';

// Test the rate limiting and cache logic independently
describe('Server-side Rate Limiting & Cache', () => {
  // Simulate the rate limiting logic from server.ts
  const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
  const AI_RATE_LIMIT_PER_MINUTE = 30;

  function checkRateLimit(clientIp: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window

    const record = rateLimitMap.get(clientIp);

    if (!record || now > record.resetTime) {
      rateLimitMap.set(clientIp, { count: 1, resetTime: now + windowMs });
      return { allowed: true };
    }

    if (record.count >= AI_RATE_LIMIT_PER_MINUTE) {
      return {
        allowed: false,
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      };
    }

    record.count++;
    return { allowed: true };
  }

  beforeEach(() => {
    rateLimitMap.clear();
  });

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', () => {
      const result = checkRateLimit('192.168.1.1');
      expect(result.allowed).toBe(true);
    });

    it('should block requests exceeding rate limit', () => {
      const clientIp = '192.168.1.1';

      // Make 30 requests (at limit)
      for (let i = 0; i < 30; i++) {
        const result = checkRateLimit(clientIp);
        expect(result.allowed).toBe(true);
      }

      // 31st request should be blocked
      const result = checkRateLimit(clientIp);
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeDefined();
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should reset rate limit after window expires', async () => {
      const clientIp = '192.168.1.1';

      // Exhaust rate limit
      for (let i = 0; i < 30; i++) {
        checkRateLimit(clientIp);
      }

      // Mock time passing (1 minute + 1 second)
      const originalDateNow = Date.now;
      Date.now = () => originalDateNow() + 61000;

      const result = checkRateLimit(clientIp);
      expect(result.allowed).toBe(true);

      Date.now = originalDateNow;
    });

    it('should track different IPs independently', () => {
      const ip1 = '192.168.1.1';
      const ip2 = '192.168.1.2';

      // Exhaust rate limit for ip1
      for (let i = 0; i < 30; i++) {
        checkRateLimit(ip1);
      }

      // ip2 should still be allowed
      const result = checkRateLimit(ip2);
      expect(result.allowed).toBe(true);
    });
  });

  describe('AI Response Cache (LRU)', () => {
    const aiResponseCache = new Map<string, { reply: any; timestamp: number }>();
    const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
    const CACHE_MAX_SIZE = 5000;

    function getCachedAIResponse(key: string): any | null {
      const entry = aiResponseCache.get(key);
      if (!entry) return null;
      if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
        aiResponseCache.delete(key);
        return null;
      }
      // Move to end for LRU behavior
      aiResponseCache.delete(key);
      aiResponseCache.set(key, entry);
      return entry.reply;
    }

    function setCachedAIResponse(key: string, reply: any): void {
      if (aiResponseCache.has(key)) {
        aiResponseCache.delete(key);
      }
      while (aiResponseCache.size >= CACHE_MAX_SIZE) {
        const oldestKey = aiResponseCache.keys().next().value;
        if (oldestKey) aiResponseCache.delete(oldestKey);
      }
      aiResponseCache.set(key, { reply, timestamp: Date.now() });
    }

    beforeEach(() => {
      aiResponseCache.clear();
    });

    it('should cache and retrieve responses', () => {
      setCachedAIResponse('key1', { message: 'hello' });
      const result = getCachedAIResponse('key1');
      expect(result).toEqual({ message: 'hello' });
    });

    it('should return null for cache miss', () => {
      const result = getCachedAIResponse('nonexistent');
      expect(result).toBeNull();
    });

    it('should evict oldest entries when cache is full', () => {
      // Fill cache to max
      for (let i = 0; i < CACHE_MAX_SIZE; i++) {
        setCachedAIResponse(`key${i}`, { id: i });
      }

      // Add one more - should evict key0
      setCachedAIResponse('key_new', { id: 'new' });

      expect(getCachedAIResponse('key0')).toBeNull();
      expect(getCachedAIResponse('key_new')).toEqual({ id: 'new' });
    });

    it('should expire entries after TTL', async () => {
      setCachedAIResponse('key1', { message: 'hello' });

      // Mock time passing beyond TTL
      const originalDateNow = Date.now;
      Date.now = () => originalDateNow() + CACHE_TTL_MS + 1000;

      const result = getCachedAIResponse('key1');
      expect(result).toBeNull();

      Date.now = originalDateNow;
    });

    it('should implement LRU by moving accessed items to end', () => {
      // Add 3 items
      setCachedAIResponse('key1', { id: 1 });
      setCachedAIResponse('key2', { id: 2 });
      setCachedAIResponse('key3', { id: 3 });

      // Access key1 (should move to end via delete+re-add)
      getCachedAIResponse('key1');

      // Current order: key2, key3, key1 (key1 at end = most recently used)

      // Fill cache to trigger eviction: need CACHE_MAX_SIZE - 3 existing + 1 to trigger
      for (let i = 0; i < CACHE_MAX_SIZE - 3; i++) {
        setCachedAIResponse(`extra${i}`, { id: `extra${i}` });
      }

      // Cache is now at CACHE_MAX_SIZE, adding one more triggers eviction
      setCachedAIResponse('trigger', { id: 'trigger' });

      // key2 should be evicted first (was least recently used - at beginning of map)
      expect(getCachedAIResponse('key2')).toBeNull();
      // key1 should still exist (was accessed recently, moved to end)
      expect(getCachedAIResponse('key1')).toEqual({ id: 1 });
      // key3 should still exist (was between key2 and key1)
      expect(getCachedAIResponse('key3')).toEqual({ id: 3 });
    });
  });
});
