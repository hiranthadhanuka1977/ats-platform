const SCHEMA_OUT_OF_DATE_MSG =
  "Database schema is out of date (missing columns). From the repo root, with DATABASE_URL set, run: npm run db:deploy — or for dev: npm run db:migrate -w @ats-platform/db";

export function prismaErrorResponse(err: unknown): { status: number; body: { error: { code: string; message?: string } } } {
  if (typeof err === "object" && err !== null && "code" in err) {
    const code = String((err as { code: unknown }).code);
    if (code === "P2002") {
      return { status: 409, body: { error: { code: "UNIQUE_VIOLATION", message: "A record with this value already exists." } } };
    }
    if (code === "P2003") {
      return {
        status: 409,
        body: { error: { code: "FOREIGN_KEY_VIOLATION", message: "This record is still referenced elsewhere and cannot be removed." } },
      };
    }
    if (code === "P2022") {
      return {
        status: 503,
        body: { error: { code: "SCHEMA_OUT_OF_DATE", message: SCHEMA_OUT_OF_DATE_MSG } },
      };
    }
  }
  return { status: 500, body: { error: { code: "INTERNAL_ERROR" } } };
}
