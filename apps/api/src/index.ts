import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { requestLogger } from "./middlewares";
import { registerRoutes } from "./routes";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, "../../../.env") });
config({ path: path.resolve(__dirname, "../../.env") });

const app = new Hono();

app.use("*", requestLogger);
registerRoutes(app);

const port = Number(process.env.PORT) || 4000;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`);
});
