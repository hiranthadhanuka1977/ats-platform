import { Hono } from "hono";

/** Internal users (recruiters, admins) & RBAC. */
export const usersModule = new Hono();

usersModule.get("/", (c) =>
  c.json({ module: "users", message: "stub — implement staff user routes" })
);
