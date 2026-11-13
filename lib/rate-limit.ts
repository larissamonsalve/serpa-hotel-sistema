const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export function checkRateLimit(ip: string, limit: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (now - record.lastReset > windowMs) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (record.count >= limit) {
    return false; 
  }

  record.count += 1;
  return true;
}