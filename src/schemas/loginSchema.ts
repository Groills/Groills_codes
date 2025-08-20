import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email should must be valid")
    .email({ message: "Username should must be valid" }),
  password: z.string().min(6)
});
