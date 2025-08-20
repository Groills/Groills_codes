import { z } from "zod";

export const isAcceptableMessageSchema = z.object({
  isAcceptable: z.boolean()
});
