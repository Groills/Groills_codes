"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signupSchema } from "@/schemas/signupSchema";
import axios, { AxiosError } from "axios";
import { FiCheck, FiRotateCw } from "react-icons/fi";
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
import Link from "next/link";
import { SkillsInput } from "@/components/ui/skillsInput";
import { motion } from "framer-motion";
import { FiUpload, FiX } from "react-icons/fi";
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

function Page() {
  const [username, setUsername] = useState("");
  const [isCheckingUsername, setIscheckingUsername] = useState(false);
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // profile pic states
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const onSelectFile = useCallback((file: File) => {
    if (file) {
      setImgSrc(URL.createObjectURL(file));
      setIsEditing(true);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      onSelectFile(acceptedFiles[0]);
    },
  });

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }

  // Update your handleSave function to set the form value:
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

  // Remove the separate onProfilePicDrop and getProfilePicRootProps entirely
  // zod implemetation
  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      skills: [""],
      wantedSkills: [""],
    },
  });


  // using useEffect to check username on the basis of debounceCallback
  useEffect(() => {
    const checkingUsername = async () => {
      if (username) {
        setIscheckingUsername(true);
        setUsernameMessage("");
        try {
          const response = await axios.get(
            `/api/check-username-unique?username=${username}`
          );

          if (response.data) {
            setUsernameMessage(response.data.message);
          }
        } catch (error) {
          const axiosError = error as AxiosError;
          const errorMessage =
            (axiosError.response?.data as { message?: string })?.message ??
            "Error while checking username";
          setUsernameMessage(errorMessage);
        } finally {
          setIscheckingUsername(false);
        }
      }
    };
    checkingUsername();
  }, [username]);

  const onSubmit = async (data: z.infer<typeof signupSchema>) => {
    setIsSubmitting(true);
    try {
      const skills = data.skills
        .filter((skill) => skill.trim().toLowerCase() !== "")
        .map((skill) => skill.trim().toLowerCase());

      const wantedSkills = data.wantedSkills
        .filter((skill) => skill.trim().toLowerCase() !== "")
        .map((skill) => skill.trim().toLowerCase());

      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("profilePic", data.profilePic);
      formData.append("skills", JSON.stringify(skills));
      formData.append("wantedSkills", JSON.stringify(wantedSkills));
      const response = await axios.post("/api/sign-up", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data) {
        toast("Sign-up successfully");
      }
      router.replace(`/sign-in`);
      setIsSubmitting(false);
    } catch (error) {
      console.error(error);
      const axiosError = error as AxiosError;
      const errorMessage = (axiosError.response?.data as { message?: string })
        ?.message;
      toast.error("Error while signning up", {
        description: errorMessage,
      });
      setIsSubmitting(false);
    }
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
            <h1 className="text-4xl font-extrabold tracking-tight pb-2 lg:text-5xl mb-6 bg-clip-text text-white">
              Join Groills
            </h1>
            <p className="mb-4 text-neutral-400">
              Sign up to start your anonymous adventure
            </p>
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
                      className="border-neutral-700 text-white focus:ring-2 focus:ring-purple-500"
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
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-300">Email</FormLabel>
                    <Input
                      {...field}
                      name="email"
                      className="border-neutral-700 text-white focus:ring-2 focus:ring-purple-500"
                    />
                    
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-300">Password</FormLabel>
                    <Input
                      type="password"
                      {...field}
                      name="password"
                      className="border-neutral-700 text-white focus:ring-2 focus:ring-purple-500"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SkillsInput name="skills" label="Your skills" />
              <SkillsInput
                name="wantedSkills"
                label="Skills you want to learn"
              />
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Profile Picture
                </label>

                {!imgSrc ? (
                  <div
                    {...getRootProps()}
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all hover:border-blue-400"
                  >
                    <input {...getInputProps()} />
                    <div className="space-y-2">
                      <div className="mx-auto h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                        <FiUpload className="h-10 w-10 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600">
                        Drag and drop your profile picture here, or click to
                        select
                      </p>
                      <p className="text-xs text-gray-600">
                        JPEG, JPG, PNG up to 5MB
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
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                      >
                        <FiX className="mr-2" /> Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <FiCheck className="mr-2" /> Save
                      </button>
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

                {/* Hidden canvas for cropping */}
                <canvas ref={previewCanvasRef} className="hidden" />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-purple-500/20"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing Up..." : "Sign Up"}
              </Button>
            </form>
          </Form>
          <div className="text-center mt-4">
            <p className="text-neutral-400">
              Already a member?{" "}
              <Link
                href="/sign-in"
                className="text-purple-400 hover:text-pink-400 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Page;
