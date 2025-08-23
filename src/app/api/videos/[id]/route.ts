import { NextRequest, NextResponse } from 'next/server';
import VideoModel from '@/model/video';
import dbConnect from '@/lib/dbConnect';

export async function GET(request: NextRequest,  { params }: { params: Promise<{ id: string }> }) {
  await dbConnect()
  const { id } = await params;
  try {
    const video = await VideoModel.findOne({ _id: id })
    return NextResponse.json({
      success: true,
      video: video,
      message: "Video fetched successfully"
    })
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch video' },
      { status: 500 }
    );
  }
}
