export function createAdminLoginRateLimit({
  windowMs = 15 * 60 * 1000,
  maxAttempts = 5,
  now = Date.now,
} = {}) {
  const attemptsByAddress = new Map();

  return (req, res, next) => {
    const address = req.ip || req.socket?.remoteAddress || "unknown";
    const currentTime = now();
    const attempts = (attemptsByAddress.get(address) ?? []).filter(
      (attemptTime) => currentTime - attemptTime < windowMs,
    );

    if (attempts.length >= maxAttempts) {
      attemptsByAddress.set(address, attempts);
      res.set(
        "Retry-After",
        String(Math.max(1, Math.ceil((windowMs - (currentTime - attempts[0])) / 1000))),
      );
      return res
        .status(429)
        .json({ message: "Too many sign-in attempts. Please try again later." });
    }

    attempts.push(currentTime);
    attemptsByAddress.set(address, attempts);

    if (attemptsByAddress.size > 10000) {
      for (const [key, timestamps] of attemptsByAddress) {
        if (timestamps.every((attemptTime) => currentTime - attemptTime >= windowMs)) {
          attemptsByAddress.delete(key);
        }
      }
    }

    return next();
  };
}
