import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await UserModel.findByIdAndUpdate(
      id,
      { $inc: { watchedVideos: 1 } },
      { new: true }
    );
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Watched video's number increases by 1",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error while increasing the number of watched video", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error while increase the number of watched video",
      },
      { status: 500 }
    );
  }
}
