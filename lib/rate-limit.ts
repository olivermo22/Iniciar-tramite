const bucket = new Map<string, { count: number; ts: number }>();

export function rateLimit(ip: string, limit = 25, windowMs = 60_000) {
  const now = Date.now();
  const prev = bucket.get(ip);
  if (!prev || now - prev.ts > windowMs) {
    bucket.set(ip, { count: 1, ts: now });
    return true;
  }
  if (prev.count >= limit) return false;
  prev.count += 1;
  return true;
}
