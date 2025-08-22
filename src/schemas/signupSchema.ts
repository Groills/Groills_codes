import { z } from "zod";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const usernameValidation = z
  .string()
  .min(2, "Username must have 2 characters")
  .max(20, "Username must have less than 20 characters");

export const signupSchema = z.object({
  username: usernameValidation,
  email: z
    .string()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email should must be valid")
    .email({ message: "Username should must be valid" }),
  password: z.string().min(6),
  skills: z
    .array(
      z
        .string()
        .min(2, "Skill must be at least 2 characters")
        .max(30, "Skill cannot exceed 30 characters")
    )
    .min(1, "At least one skill is required")
    .max(10, "Maximum 10 skills allowed"),
  wantedSkills: z
    .array(z.string())
    .min(1, "At least one skill is required")
    .max(10, "Maximum 10 skills allowed"),
  profilePic: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, "Max image size is 5MB")
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported"
    ),
});
