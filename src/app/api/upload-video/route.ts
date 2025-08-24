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
    // 1. Parse JSON (not formData)
    const body = await request.json();
    const { title, description, videoUrl, thumbnailUrl, video_skills, etag, duration } = body;

    if (!title || !description || !videoUrl) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 2. Save to DB
    const newVideo = await VideoModel.create({
      title,
      description,
      video: videoUrl,
      thumbnail: thumbnailUrl,
      user: session.user._id,
      videoSkills: video_skills || [],
      etag,
      duration,
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
