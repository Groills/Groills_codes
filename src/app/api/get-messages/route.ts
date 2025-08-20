import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import MessageModel from "@/model/messages";

export async function GET() {
  dbConnect();
  try {
    const session = await getServerSession(authOptions);
    const messages = await MessageModel.find({ ownerId: session?.user._id })
      .sort({ createdAt: -1 }) // 👈 newest → oldest
      .exec();
    return NextResponse.json({
      success: true,
      messages: messages,
    });
  } catch (error) {
    console.log("Error while gettig user messages", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error while getting user messages",
      },
      { status: 500 }
    );
  }
}
