import { Hono } from "hono";
import { applicationsModule } from "../modules/applications";
import { authModule } from "../modules/auth";
import { candidatesModule } from "../modules/candidates";
import { interviewsModule } from "../modules/interviews";
import { jobsModule } from "../modules/jobs";
import { notificationsModule } from "../modules/notifications";
import { usersModule } from "../modules/users";
import { demoRoutes } from "./demo";
import { healthRoutes } from "./health";

/**
 * Mounts HTTP routes. Domain JSON API lives under `/api/v1` (see docs/specification/api/README.md).
 * `/health` stays at the root for simple probes.
 */
export function registerRoutes(app: Hono) {
  app.route("/health", healthRoutes);
  app.route("/demo", demoRoutes);

  const v1 = new Hono();
  v1.route("/auth", authModule);
  v1.route("/jobs", jobsModule);
  v1.route("/candidates", candidatesModule);
  v1.route("/applications", applicationsModule);
  v1.route("/interviews", interviewsModule);
  v1.route("/users", usersModule);
  v1.route("/notifications", notificationsModule);

  app.route("/api/v1", v1);
}
