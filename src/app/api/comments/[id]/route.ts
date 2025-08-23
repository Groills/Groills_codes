import dbConnect from "@/lib/dbConnect";
import CommentsModel from "@/model/comments";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const { id } = params;
  try {
    const comments = await CommentsModel.find({ videoId: id })
      .sort({ createdAt: -1 }) // 👈 newest → oldest
      .exec();
    return NextResponse.json(
      {
        success: true,
        message: "Comment fetched successfully",
        comments: comments,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error while creating comment:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error while creating comment",
      },
      { status: 500 }
    );
  }
}
