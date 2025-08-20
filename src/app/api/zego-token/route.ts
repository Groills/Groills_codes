// /app/api/zego-token/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";

const appID = parseInt(process.env.ZEGOAPP_ID || "0", 10);
const serverSecret = process.env.ZEGO_SERVER_SECRET!;

export async function POST(req: Request) {
  try {
    const { roomID, userID, userName } = await req.json();

    if (!roomID || !userID || !userName || !appID || !serverSecret) {
      return NextResponse.json(
        { success: false, message: "All credentials are required" },
        { status: 400 }
      );
    }

    // Token expiry (1 hour from now)
    const effectiveTimeInSeconds = 3600;
    const currentTime = Math.floor(Date.now() / 1000);
    const expireTime = currentTime + effectiveTimeInSeconds;

    const payloadObject = {
      app_id: appID,
      user_id: userID,
      room_id: roomID,
      privilege: {
        1: 1, // login
        2: 1, // publish stream
      },
      create_time: currentTime,
      expire_time: expireTime,
      nonce: Math.floor(Math.random() * 100000),
    };

    const payload = Buffer.from(JSON.stringify(payloadObject)).toString("base64");
    const hash = crypto
      .createHmac("sha256", serverSecret)
      .update(payload)
      .digest("hex");

    const token = `${appID}:${hash}:${payload}`;

    return NextResponse.json(
      { success: true, token, message: "Token generated securely" },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
