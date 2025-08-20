import dbConnect from "@/lib/dbConnect";
import MessageModel from "@/model/messages";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, message: "Message is required" },
        { status: 400 }
      );
    }

    const updatedMessage = await MessageModel.findByIdAndUpdate(
      message._id,
      { isAccepted: true },
      { new: true }
    );
    if (!updatedMessage) {
      return NextResponse.json({
        success: false,
        message: "Message not found",
      });
    }
    
    return NextResponse.json(
      {
        success: true,
        message: "Message accepted",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error while updating isAccepted message:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error while updating isAccepted message",
      },
      { status: 500 }
    );
  }
}
