import { Hono } from "hono";
import { paginationQuerySchema } from "@ats-platform/validators";

/** Example route using shared validators — safe to remove once real routes exist. */
export const demoRoutes = new Hono();

demoRoutes.get("/pagination", (c) => {
  const parsed = paginationQuerySchema.safeParse(c.req.query());
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }
  return c.json({ data: parsed.data });
});
