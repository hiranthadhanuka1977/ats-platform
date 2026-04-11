import { Hono } from "hono";

/** Candidate profiles & registration. */
export const candidatesModule = new Hono();

candidatesModule.get("/", (c) =>
  c.json({ module: "candidates", message: "stub — implement candidate routes" })
);
