import { z } from "zod";

// Make sure user doesn't abuse the api usage
export const QueryValidator = z.object({
  category: z.string().optional(),
  sort: z.enum(["asc", "desc"]).optional(),
  limit: z.number().optional(),
});

export type TQueryValidator = z.infer<typeof QueryValidator>;
