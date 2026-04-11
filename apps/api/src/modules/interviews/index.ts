import { Hono } from "hono";

/** Interview scheduling & status. */
export const interviewsModule = new Hono();

interviewsModule.get("/", (c) =>
  c.json({ module: "interviews", message: "stub — implement interview routes" })
);
