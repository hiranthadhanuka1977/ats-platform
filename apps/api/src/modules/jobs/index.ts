import { Hono } from "hono";

/** Job postings (public list/detail, staff CRUD). */
export const jobsModule = new Hono();

jobsModule.get("/", (c) =>
  c.json({ module: "jobs", message: "stub — implement job routes" })
);
