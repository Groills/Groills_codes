import { z } from "zod";

// Maximum 5MB for thumbnail
const MAX_FILE_SIZE = 5 * 1024 * 1024;
// Maximum 100MB for video
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime", // mov
  "video/x-msvideo", // avi
];

export const videoValidationSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
    
  description: z.string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
    
  thumbnail: z.instanceof(File)
    .refine(file => file.size <= MAX_FILE_SIZE, "Max image size is 5MB")
    .refine(
      file => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported"
    ),
    
  video: z.instanceof(File)
    .refine(file => file.size <= MAX_VIDEO_SIZE, "Max video size is 100MB")
    .refine(
      file => ACCEPTED_VIDEO_TYPES.includes(file.type),
      "Only .mp4, .mov and .avi formats are supported"
    ),
    
  video_skills: z.array(
    z.string()
      .min(2, "Skill must be at least 2 characters")
      .max(20, "Skill must be less than 20 characters")
  ),
  
  // This is for the input field, not part of the final form data
  newSkill: z.string().optional()
});

// Type for TypeScript usage
export type VideoUploadFormData = z.infer<typeof videoValidationSchema>;

