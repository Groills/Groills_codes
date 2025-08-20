import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import VideoModel from "@/model/video";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username } = await request.json();
    const user = await UserModel.findOne({ username });

    const UserWantedSkills = user?.WantedSkills;

    const videos = await VideoModel.find({
      videoSkills: { $in: UserWantedSkills },
    })
      .sort({ createdAt: -1 }) 
      .exec();
    return NextResponse.json(
      {
        success: true,
        message: "Video fetched successfully",
        videos: videos,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(
      "Error while getting video on the basis of skills the user",
      error
    );
    return Response.json(
      {
        success: false,
        message: "Error while getting videos by skills",
      },
      { status: 500 }
    );
  }
}
