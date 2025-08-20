// app/api/token/route.ts
import { NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const identity = url.searchParams.get('identity') || 'guest';
  const room = url.searchParams.get('room') || 'default-room';

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_SECRET!,
    { identity }
  );

  at.addGrant({
    room,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });

  const jwt = await at.toJwt();
  return NextResponse.json({ token: jwt });
}
