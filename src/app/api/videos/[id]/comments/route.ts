import dbConnect from "@/lib/dbConnect";
import CommentsModel from "@/model/comments";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  // Then access params
  const { id } = context.params;

  // Rest of your implementation...
  const body = await request.json();
  const { text } = body;
  try {
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Please Sign In" },
        { status: 401 }
      );
    }

    const userId = session.user?._id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID not found in session" },
        { status: 401 }
      );
    }

    const newComment = await CommentsModel.create({
      text,
      videoId: id,
      userId,
    });

    return NextResponse.json(
      { success: true, message: "Comment added successfully", comment: newComment},
      { status: 201 }
    );
  } catch (error) {
    console.error("Error while creating comment:", error);
    return NextResponse.json(
      { success: false, message: "Error while creating comment" },
      { status: 500 }
    );
  }
}
