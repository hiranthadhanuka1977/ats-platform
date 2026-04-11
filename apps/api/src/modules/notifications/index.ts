import { Hono } from "hono";

/** Email / in-app / push notifications. */
export const notificationsModule = new Hono();

notificationsModule.get("/", (c) =>
  c.json({ module: "notifications", message: "stub — implement notification routes" })
);
