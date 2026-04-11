import { createMiddleware } from "hono/factory";

/** Basic request logging — replace with structured logger in production. */
export const requestLogger = createMiddleware(async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`[api] ${c.req.method} ${c.req.path} ${c.res.status} ${ms}ms`);
});
