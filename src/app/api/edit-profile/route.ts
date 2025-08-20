import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import uploadOnCloudinary from "@/helpers/cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const formData = await request.formData();
    const session = await getServerSession(authOptions);
    const username = formData.get("username") as string;
    const skills = JSON.parse(formData.get("skills") as string);
    const wantedSkills = JSON.parse(formData.get("wantedSkills") as string);
    const profilePic = formData.get("profilePic") as File;

    console.log(username);
    const existedUserbyUsername = await UserModel.findOne({
      email: session?.user.email,
      isVerified: true,
    });

    if (!existedUserbyUsername) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }
    let profilePicUpload = null;

    if (profilePic && profilePic.size > 0) {
      const profilePicBuffer = await profilePic.arrayBuffer();
      profilePicUpload = await uploadOnCloudinary(
        Buffer.from(profilePicBuffer),
        "image"
      );
      existedUserbyUsername.profilePic = profilePicUpload?.url ?? "";
    }

    if (username) {
      existedUserbyUsername.username = username;
    }
    if (Array.isArray(skills) && skills.length > 0)
      existedUserbyUsername.skills = skills;
    if (Array.isArray(wantedSkills) && wantedSkills.length > 0)
      existedUserbyUsername.WantedSkills = wantedSkills;
    if (profilePic && profilePic.size > 0)
      existedUserbyUsername.profilePic = profilePicUpload?.url ?? "";

    await existedUserbyUsername.save();
    
    return NextResponse.json(
      {
        success: true,
        message: "Edited successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error while registering the user", error);
    return Response.json(
      {
        success: false,
        message: "Error while registering User" + error,
      },
      { status: 500 }
    );
  }
}
