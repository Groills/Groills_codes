import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import MessageModel from "@/model/messages";

export async function POST(
  request: Request
) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const body = await request.json();
  const { text, ownerId, link } = body;
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

    const newMessage = await MessageModel.create({
      text,
      ownerId,
      userId,
      link
    });

    return NextResponse.json(
      { success: true, message: "Message sent successfully", newMessage: newMessage},
      { status: 201 }
    );
  } catch (error) {
    console.log("Error while creating message:", error);
    return NextResponse.json(
      { success: false, message: "Error while creating message" + error },
      { status: 500 }
    );
  }
}
