import dbConnect from "@/lib/dbConnect";
import CommentsModel from "@/model/comments";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  
  // Await the params promise
  const params = await context.params;
  const { id } = params;

  try {
    const comments = await CommentsModel.find({ videoId: id })
      .sort({ createdAt: -1 }) // newest → oldest
      .exec();

    return NextResponse.json(
      {
        success: true,
        message: "Comments fetched successfully",
        comments,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error while fetching comments:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error while fetching comments",
      },
      { status: 500 }
    );
  }
}