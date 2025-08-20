import { z } from "zod";

export const messageSchema = z.object({
  message: z.string().min(10, "message should must have at least 10 characters").max(300, "message should must not have more than 300 characters")
});
