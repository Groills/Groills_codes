import dbConnect from "@/lib/dbConnect";
import MessageModel from "@/model/messages";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { userId, ownerId } = body;

    if (!userId || !ownerId) {
      return NextResponse.json(
        { success: false, message: "IDs are required" },
        { status: 400 }
      );
    }

    // Find the newest message by sorting in descending order
    const message = await MessageModel.findOne({ userId, ownerId })
      .sort({ createdAt: -1 }) // newest first
      .exec();

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message: "Message not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Newest message fetched successfully",
        userMessage: message,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error while getting message:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error while getting message",
      },
      { status: 500 }
    );
  }
}
