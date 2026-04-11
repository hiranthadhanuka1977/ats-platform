import { Hono } from "hono";

/** Applications to job postings. */
export const applicationsModule = new Hono();

applicationsModule.get("/", (c) =>
  c.json({ module: "applications", message: "stub — implement application routes" })
);
