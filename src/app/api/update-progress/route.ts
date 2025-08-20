import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextResponse } from "next/server";
import "@/helpers/progressReset"

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const getToday = ():
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday" => {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  if (days.includes(today as any)) {
    return today as (typeof days)[number];
  }
  throw new Error(`Invalid day string: ${today}`);
};

export async function POST(req: Request) {
  await dbConnect();

  const { userId, progress } = await req.json();

  if (!userId || typeof progress !== "number") {
    return NextResponse.json(
      {
        success: false,
        message: "Credentials not allowed",
      },
      { status: 400 }
    );
  }

  const today = getToday();
  const todayIndex = days.indexOf(today);

  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Reset all progress on Monday
    if (today === "Monday") {
      user.progressData.forEach(data => {
        data.progress = 0;
      });
    }

    // Set all future days' progress to 0
    user.progressData.forEach(data => {
      const dataIndex = days.indexOf(data.day);
      if (dataIndex > todayIndex) {
        data.progress = 0;
      }
    });

    // Update today's progress
    const todayData = user.progressData.find(data => data.day === today);
    if (todayData) {
      todayData.progress = progress;
    } else {
      user.progressData.push({ day: today, progress });
    }

    await user.save();
    return NextResponse.json(
      {
        success: true,
        message: "Updated progress successfully",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        success: false,
        message: "Error while updating progress",
      },
      { status: 500 }
    );
  }
}
