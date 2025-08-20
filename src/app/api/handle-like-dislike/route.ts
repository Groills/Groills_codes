import dbConnect from "@/lib/dbConnect";
import CommentsModel from "@/model/comments";
import VideoModel from "@/model/video";
import { NextRequest, NextResponse } from "next/server";

type Action = "like" | "dislike";
type TargetType = "video" | "comment";

interface LikeRequestBody {
  type: TargetType;
  id: string;
  action: Action;
}

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body: LikeRequestBody = await req.json();
    const { type, id, action } = body;

    if (
      !["video", "comment"].includes(type) ||
      !["like", "dislike"].includes(action)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid request" },
        { status: 400 }
      );
    }
    if (type === "video") {
      if (action === "like") {
        const updated = await VideoModel.findByIdAndUpdate(
          id,
          { $inc: { likes: 1 } },
          { new: true }
        );
        return NextResponse.json({
          success: true,
          message: "Liked successfully",
          likes: updated?.likes
        });
      } else {
        const updated = await VideoModel.findByIdAndUpdate(
          id,
          { $inc: { likes: -1 } },
          { new: true }
        );
        return NextResponse.json({
          success: true,
          message: "Disliked successfully",
          likes: updated?.likes
        });
      }
    } else {
      if (action === "like") {
        const updated = await CommentsModel.findByIdAndUpdate(
          id,
          { $inc: { likes: 1 } },
          { new: true }
        );
        return NextResponse.json({
          success: true,
          message: "Liked successfully",
          likes: updated?.likes
        });
      } else {
        const updated = await CommentsModel.findByIdAndUpdate(
          id,
          { $in: { likes: -1 } },
          { new: true }
        );
        return NextResponse.json({
          success: true,
          message: "Disliked successfully",
          likes: updated?.likes
        });
      }
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error,
    });
  }
}
