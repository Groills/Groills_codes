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

    const user = await UserModel.findById(id);
    
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
        message: "Video fetched successfully",
        user: user,
        owner: user?.username || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error while getting user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error while getting user by id",
      },
      { status: 500 }
    );
  }
}
