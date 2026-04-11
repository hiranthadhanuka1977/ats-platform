import { z } from "zod";

export { z };

/** Example shared schema — extend with API DTOs. */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(15),
});
