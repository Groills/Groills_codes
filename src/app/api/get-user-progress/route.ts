import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextResponse } from "next/server";

const getToday = ():
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday" => {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ] as const;

  if (days.includes(today as (typeof days)[number])) {
    return today as (typeof days)[number];
  }
  throw new Error(`Invalid day string: ${today}`);
};

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const { userId } = body
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await UserModel.findById(userId)
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }
    const today = getToday()
    const todayProgress = user.progressData.find(data => data.day === today)?.progress || 0;
    return NextResponse.json(
      {
        success: true,
        message: "Progress fetched successfully",
        progress: todayProgress,
        day: today
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error while fetching progress:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error while fetching user today's progress",
      },
      { status: 500 }
    );
  }
}
