import dbConnect from "@/lib/dbConnect";
import MessageModel from "@/model/messages";
import VideoModel from "@/model/video";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  dbConnect();
  try {
    const { id, model } = await request.json();
    
    if(model == "Video"){
      await VideoModel.findByIdAndDelete(id)
    } 
    if(model == "Message"){
      await MessageModel.findByIdAndDelete(id)
    }
    
    return NextResponse.json({
        success: true,
        message: `${model} deleted successfully`
    })
  } catch (error) {
    console.log("Error while deleting video", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error while deleting video",
      },
      { status: 500 }
    );
  }
}
