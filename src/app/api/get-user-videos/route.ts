import { NextResponse } from "next/server";
import VideoModel from "@/model/video";
import dbConnect from "@/lib/dbConnect";

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();

  const { id } = body;
  if (!body || !id) {
    return NextResponse.json(
      { success: false, message: "Id is required to fetch videos" },
      { status: 401 }
    );
  }
  try {
    const videos = await VideoModel.find({ user: id })
      .sort({ createdAt: -1 }) // 👈 newest → oldest
      .exec();

    return NextResponse.json({
      success: true,
      videos: videos,
      message: "Videos fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}
