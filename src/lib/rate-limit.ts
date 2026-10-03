// Simple robust in-memory token bucket rate limiter
type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const trackers = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60 * 1000 // 1 minute window
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = trackers.get(identifier);

  // Clean up if window expired
  if (!record || now > record.resetAt) {
    trackers.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      success: true,
      remaining: limit - 1,
      resetAt: now + windowMs,
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  record.count += 1;
  trackers.set(identifier, record);

  return {
    success: true,
    remaining: limit - record.count,
    resetAt: record.resetAt,
  };
}
