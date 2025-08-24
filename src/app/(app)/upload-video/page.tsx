"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { FiUpload, FiX, FiPlus, FiTrash2 } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { videoValidationSchema } from "@/schemas/videoSchema"; // Your Zod schema from previous example
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
type FormData = z.infer<typeof videoValidationSchema>;

const VideoUploadForm = () => {
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
    trigger,
  } = useForm<FormData>({
    resolver: zodResolver(videoValidationSchema),
    defaultValues: {
      title: "",
      description: "",
      video_skills: [],
      newSkill: "",
    },
  });

  const skills = watch("video_skills");
  const newSkill = watch("newSkill");

  const onThumbnailDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setValue("thumbnail", file, { shouldValidate: true });
        setThumbnailPreview(URL.createObjectURL(file));
      }
    },
    [setValue]
  );

  const onVideoDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setValue("video", file, { shouldValidate: true });
        setVideoPreview(URL.createObjectURL(file));
      }
    },
    [setValue]
  );

  const {
    getRootProps: getThumbnailRootProps,
    getInputProps: getThumbnailInputProps,
  } = useDropzone({
    onDrop: onThumbnailDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png"] },
    maxFiles: 1,
  });

  const { getRootProps: getVideoRootProps, getInputProps: getVideoInputProps } =
    useDropzone({
      onDrop: onVideoDrop,
      accept: { "video/*": [".mp4", ".mov", ".avi"] },
      maxFiles: 1,
    });

  const addSkill = () => {
    const trimmedSkill = newSkill?.trim().toLowerCase();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      const updatedSkills = [...skills, trimmedSkill];
      setValue("video_skills", updatedSkills, { shouldValidate: true });
      setValue("newSkill", "");
      trigger("video_skills");
    }
  };

  const removeSkill = (index: number) => {
    const updatedSkills = [...skills];
    updatedSkills.splice(index, 1);
    setValue("video_skills", updatedSkills, { shouldValidate: true });
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // 1. Get Cloudinary signature from API
      const sigRes = await axios.get("/api/cloudinary-sign");
      const { timestamp, signature, cloudName, apiKey } = sigRes.data;

      // 2. Upload video to Cloudinary
      const videoForm = new FormData();
      videoForm.append("file", data.video);
      videoForm.append("api_key", apiKey);
      videoForm.append("timestamp", timestamp);
      videoForm.append("signature", signature);

      const videoRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        videoForm,
        {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            }
          },
        }
      );

      const videoUrl = videoRes.data.secure_url;

      // 3. Upload thumbnail (optional)
      let thumbnailUrl = "";
      if (data.thumbnail) {
        const thumbForm = new FormData();
        thumbForm.append("file", data.thumbnail);
        thumbForm.append("api_key", apiKey);
        thumbForm.append("timestamp", timestamp);
        thumbForm.append("signature", signature);

        const thumbRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          thumbForm
        );

        thumbnailUrl = thumbRes.data.secure_url;
      }

      // 4. Send metadata + URLs to your backend
      const payload = {
        title: data.title,
        description: data.description,
        video_skills: data.video_skills.map((s) => s.toLowerCase()),
        videoUrl,
        thumbnailUrl,
        etag: videoRes.data.etag,
        duration: videoRes.data.duration,
      };

      const response = await axios.post("/api/upload-video", payload);

      if (!response.data.success) {
        toast.error(response.data.message);
      } else {
        toast.success("Video uploaded successfully!");
        reset();
        setThumbnailPreview(null);
        setVideoPreview(null);
        router.replace("/user/videos");
      }
    } catch (error: any) {
      console.error("Upload failed:", error);
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto p-6 bg-gray-800/40 rounded-xl shadow-lg my-13"
    >
      <h1 className="text-3xl font-bold text-white mb-6">Upload Video</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-white mb-1"
          >
            Title
          </label>
          <input
            id="title"
            {...register("title")}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
              errors.title ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter video title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-white mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            {...register("description")}
            rows={4}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter video description"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Thumbnail Upload */}
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Thumbnail
          </label>
          <div
            {...getThumbnailRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all hover:border-blue-400 ${
              errors.thumbnail ? "border-red-500" : "border-gray-300"
            }`}
          >
            <input {...getThumbnailInputProps()} />
            {thumbnailPreview ? (
              <div className="relative">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="mx-auto max-h-48 rounded-md"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setThumbnailPreview(null);
                    setValue("thumbnail", null as unknown as File, {
                      shouldValidate: true,
                    });
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                >
                  <FiX size={16} />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <FiUpload className="mx-auto h-10 w-10 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Drag and drop your thumbnail here, or click to select
                </p>
                <p className="text-xs text-gray-600">
                  JPEG, JPG, PNG up to 5MB
                </p>
              </div>
            )}
          </div>
          {errors.thumbnail && (
            <p className="mt-1 text-sm text-red-600">
              {errors.thumbnail.message}
            </p>
          )}
        </div>

        {/* Video Upload */}
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Video
          </label>
          <div
            {...getVideoRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all hover:border-blue-400 ${
              errors.video ? "border-red-500" : "border-gray-300"
            }`}
          >
            <input {...getVideoInputProps()} />
            {videoPreview ? (
              <div className="relative">
                <video
                  src={videoPreview}
                  className="mx-auto max-h-48 rounded-md"
                  controls
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setVideoPreview(null);
                    setValue("video", null as unknown as File, {
                      shouldValidate: true,
                    });
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                >
                  <FiX size={16} />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <FiUpload className="mx-auto h-10 w-10 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Drag and drop your video here, or click to select
                </p>
                <p className="text-xs text-gray-500">
                  MP4, MOV, AVI up to 100MB
                </p>
              </div>
            )}
          </div>
          {errors.video && (
            <p className="mt-1 text-sm text-red-600">{errors.video.message}</p>
          )}
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Skills
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              {...register("newSkill")}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Add a skill"
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addSkill())
              }
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purle-700 transition-colors flex items-center"
            >
              <FiPlus className="mr-1" /> Add
            </button>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <FiTrash2 size={14} />
                </button>
              </motion.div>
            ))}
          </div>
          {errors.video_skills && (
            <p className="mt-1 text-sm text-red-600">
              {errors.video_skills.message}
            </p>
          )}
        </div>
        {/* Upload Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isUploading}
            className={`w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all ${
              isUploading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isUploading ? "Uploading..." : "Upload Video"}
          </button>

          {isUploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 w-full bg-gray-200 rounded-full h-2.5"
            >
              <div
                className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </motion.div>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default VideoUploadForm;
