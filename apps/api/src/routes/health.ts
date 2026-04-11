import { Hono } from "hono";

export const healthRoutes = new Hono();

healthRoutes.get("/", (c) =>
  c.json({
    ok: true,
    service: "@ats-platform/api",
    ts: new Date().toISOString(),
  })
);
