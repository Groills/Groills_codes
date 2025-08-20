import uploadOnCloudinary from "@/helpers/cloudinary";
import VideoModel from "@/model/video";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";

export async function POST(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session?.user?._id) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
  
  try {
    const formData = await request.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const thumbnail = formData.get("thumbnail") as File;
    const video = formData.get("video") as File;
    const video_skills = formData.getAll("video_skills") as string[];

    const thumbnailBuffer = await thumbnail.arrayBuffer();
    const videoBuffer = await video.arrayBuffer();

    const thumbnailUpload = await uploadOnCloudinary(
      Buffer.from(thumbnailBuffer),
      "image"
    );
    const videoUpload = await uploadOnCloudinary(
      Buffer.from(videoBuffer),
      "video"
    );

    const etag = videoUpload?.etag

    
    
    const newVideo = await VideoModel.create({
      title,
      description,
      video: videoUpload?.url,
      thumbnail: thumbnailUpload?.url,
      isPublished: true,
      user: session.user._id,
      videoSkills: video_skills,
      etag: etag,
      duration: videoUpload?.duration 
    });

    return NextResponse.json(
      {
        success: true,
        message: "Video uploaded successfully",
        data: newVideo,
      },
      { status: 201 }
    ); 
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}

