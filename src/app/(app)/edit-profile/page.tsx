"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { FiCheck, FiRotateCw, FiUpload, FiX } from "react-icons/fi";
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SkillsInput } from "@/components/ui/skillsInput";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

function EditProfile() {
  const [username, setUsername] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setImgSrc(URL.createObjectURL(file));
        setIsEditing(true);
      }
    },
  });
  const editProfileSchema = z.object({
    username: z.string(),
    skills: z.array(z.string()).default([]),
    wantedSkills: z.array(z.string()).default([]),
    profilePic: z.instanceof(File).optional(),
  });

  const form = useForm({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      username: "",
      skills: [],
      wantedSkills: [],
      profilePic: undefined,
    },
  });

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }

  function handleSave() {
    if (!completedCrop || !imgRef.current) return;

    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    canvas.width = 256;
    canvas.height = 256;

    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], "profile-pic.png", { type: "image/png" });
      form.setValue("profilePic", file);
      setIsEditing(false);

      const previewURL = URL.createObjectURL(file);
      setImgSrc(previewURL);
    }, "image/png");
  }

  useEffect(() => {
    const checkUsername = async () => {
      if (username) {
        setIsCheckingUsername(true);
        setUsernameMessage("");
        try {
          const response = await axios.get(
            `/api/check-username-unique?username=${username}`
          );
          setUsernameMessage(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError;
          setUsernameMessage(
            (axiosError.response?.data as { message?: string })?.message ??
              "Error checking username"
          );
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };
    checkUsername();
  }, [username]);

  const onSubmit = async (data: z.infer<typeof editProfileSchema>) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("username", data.username);
      if (data.profilePic) {
        formData.append("profilePic", data.profilePic);
      }
      formData.append("skills", JSON.stringify(data.skills));
      formData.append("wantedSkills", JSON.stringify(data.wantedSkills));

      const response = await axios.post("/api/edit-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Edited successful", {
        description: response.data.message,
      });
      router.replace(`/dashboard`);
    } catch (error) {
      const axiosError = error as AxiosError;
      toast.error("Editing failed", {
        description: (axiosError.response?.data as { message?: string })
          ?.message,
      });
    } finally {
      setIsSubmitting(false);
      setShowPopup(false);
    }
  };

  const handleCancelPic = async () => {
    setIsEditing(false);
    setImgSrc(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-center items-center min-h-screen bg-neutral-950">
        <div className="w-full max-w-md p-8 space-y-8 bg-gray-800/40 rounded-lg border border-neutral-800 shadow-lg">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white">Edit Profile</h1>
            <p className="text-neutral-400">Update your profile information</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                name="username"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-300">Username</FormLabel>
                    <Input
                      {...field}
                      placeholder="New Username"
                      className="border-neutral-700 text-white"
                      onChange={(e) => {
                        field.onChange(e);
                        setUsername(e.target.value);
                      }}
                    />
                    <p
                      className={`text-sm transition-colors ${
                        isCheckingUsername
                          ? "text-white"
                          : usernameMessage === "Username is available"
                            ? "text-green-400"
                            : "text-pink-500"
                      }`}
                    >
                      {isCheckingUsername
                        ? "Checking..."
                        : usernameMessage || "\u00A0"}
                    </p>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <SkillsInput name="skills" label="Your Skills" />
              <SkillsInput name="wantedSkills" label="New Skills to Learn" />

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Profile Picture
                </label>

                {!imgSrc ? (
                  <div
                    {...getRootProps()}
                    className="border-2 border-dashed border-neutral-700 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400"
                  >
                    <input {...getInputProps()} />
                    <div className="space-y-2">
                      <div className="mx-auto h-24 w-24 rounded-full bg-gray-700 flex items-center justify-center">
                        <FiUpload className="h-10 w-10 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-400">
                        Drag & drop or click to select an image (JPEG/PNG)
                      </p>
                    </div>
                  </div>
                ) : isEditing ? (
                  <div className="space-y-4">
                    <ReactCrop
                      crop={crop}
                      onChange={(c) => setCrop(c)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={1}
                      circularCrop
                    >
                      <img
                        ref={imgRef}
                        src={imgSrc}
                        onLoad={onImageLoad}
                        className="max-h-64 rounded-md"
                      />
                    </ReactCrop>

                    <div className="flex justify-center space-x-4">
                      <Button
                        type="button"
                        onClick={handleCancelPic}
                        variant="secondary"
                      >
                        <FiX className="mr-1" /> Cancel
                      </Button>
                      <Button
                        type="button"
                        className="bg-purple-700 text-white hover:bg-purple-600"
                        onClick={handleSave}
                      >
                        <FiCheck className="mr-1" /> Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative flex justify-center">
                    <div className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-gray-300">
                      <img
                        src={imgSrc}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                    >
                      <FiRotateCw size={16} />
                    </button>
                  </div>
                )}
              </div>

              <Button
                type="button"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:from-purple-700 hover:to-pink-700"
                disabled={isSubmitting}
                onClick={() => setShowPopup(true)}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
              {showPopup && (
                <div className="bg-white dark:bg-gray-800/40 p-6 rounded-xl shadow-xl w-full max-w-sm text-center border border-purple-500">
                  <h2 className="text-xl font-bold mb-4 text-purple-400">
                    Confirm Changes
                  </h2>
                  <p className="text-sm text-neutral-400 mb-4">
                    Are you sure you want to save these profile changes?
                  </p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setShowPopup(false)}
                      className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </div>
      </div>
    </motion.div>
  );
}

export default EditProfile;
