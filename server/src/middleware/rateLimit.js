// In-memory sliding-window rate limit. One Render instance, so no Redis: this
// is a comfort guard against a bot posting a hundred quote requests, not a
// defence against a distributed attack. Counters reset on restart.

const buckets = new Map();

export default function rateLimit({ windowMs = 15 * 60 * 1000, max = 5, message } = {}) {
  return (req, res, next) => {
    if (process.env.DISABLE_RATE_LIMIT === "1") return next();

    const key = `${req.baseUrl}${req.path}|${req.clientIp || req.ip}`;
    const now = Date.now();
    const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);

    if (hits.length >= max) {
      const wait = Math.ceil((windowMs - (now - hits[0])) / 60000);
      return res.status(429).json({
        message: message || `Trop de demandes. Réessayez dans ${wait} minute${wait > 1 ? "s" : ""}.`,
      });
    }

    hits.push(now);
    buckets.set(key, hits);

    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
    return next();
  };
}
