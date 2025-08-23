import dbConnect from "@/lib/dbConnect";
import VideoModel from "@/model/video";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }

) {
  await dbConnect();
   const { id } = await params;

  try {
    const video = await VideoModel.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!video) {
      return NextResponse.json({ success: false, message: "Video not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, views: video.views });
  } catch (error) {
    console.error("Error updating views:", error);
    return NextResponse.json({ success: false, message: "Error updating views" }, { status: 500 });
  }
}
