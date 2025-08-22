// components/ZegoMeetingClient.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import type { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
// Dynamically import ZegoUIKitPrebuilt (client-only)
const getZego = () =>
  import("@zegocloud/zego-uikit-prebuilt").then((mod) => mod.ZegoUIKitPrebuilt);

export default function VideoMeeting() {
  const { data: session, status: sessionStatus } = useSession();
  const containerRef = useRef<HTMLDivElement>(null);
  const zpRef = useRef<ZegoUIKitPrebuilt | null>(null);
  const router = useRouter();
  const params = useParams();
  const roomId = Array.isArray(params.roomId) ? params.roomId[0] : params.roomId;

  const [meetingStatus, setMeetingStatus] = useState<"init" | "joining" | "joined" | "error">("init");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current || sessionStatus !== "authenticated") return;

    let mounted = true;

    const startMeeting = async () => {
      try {
        setMeetingStatus("joining");
        setError("");

        const ZegoUIKitPrebuilt = await getZego();
        if (!ZegoUIKitPrebuilt) throw new Error("Failed to load ZegoUIKitPrebuilt");

        const userID = session?.user.email?.replace(/[^\w]/g, "_") || `user_${Date.now()}`;

        const res = await axios.post(
          "/api/zego-token",
          { roomId, userId: userID },
          { headers: { "Content-Type": "application/json" } }
        );

        const token = res.data.token;
        if (!token) throw new Error("Token missing from backend");

        const zp = ZegoUIKitPrebuilt.create(token);
        zpRef.current = zp;

        const timeoutId = window.setTimeout(() => {
          if (mounted) {
            setError("Connection timeout");
            setMeetingStatus("error");
          }
        }, 15000);

        zp.joinRoom({
          container: containerRef.current!,
          scenario: { mode: ZegoUIKitPrebuilt.VideoConference },
          showPreJoinView: false,
          turnOnMicrophoneWhenJoining: true,
          turnOnCameraWhenJoining: false,
          onJoinRoom: () => {
            clearTimeout(timeoutId);
            if (mounted) setMeetingStatus("joined");
          },
          onLeaveRoom: () => {
            router.push("/dashboard");
          },
        });
      } catch (err: unknown) {
        console.error("Meeting init error:", err);
        if(err instanceof Error){
          setError(err?.message || "Unknown error");
        }
        setMeetingStatus("error");
      }
    };

    startMeeting();

    return () => {
      mounted = false;
      if (zpRef.current?.destroy) {
        zpRef.current.destroy();
      }
    };
  }, [sessionStatus, session, roomId, router]);

  return (
    <div className="relative h-screen w-full bg-black">
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {meetingStatus === "init" || meetingStatus === "joining" ? (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 z-10 relative">
          <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-white text-lg">
            {meetingStatus === "init" ? "Preparing meeting..." : "Joining room..."}
          </p>
          <p className="mt-2 text-gray-400 text-sm">Room ID: {roomId}</p>
        </div>
      ) : meetingStatus === "error" ? (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 p-6 z-10 relative">
          <div className="bg-red-900/50 border border-red-700 text-red-100 px-6 py-4 rounded-lg mb-6 max-w-md text-center">
            <h3 className="font-bold text-xl mb-2">Meeting Error</h3>
            <p>{error || "Failed to join meeting"}</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setMeetingStatus("init");
                setError("");
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded"
            >
              Retry
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded"
            >
              Exit
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => zpRef.current?.destroy()}
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full shadow-lg z-10"
        >
          Leave Meeting
        </button>
      )}
    </div>
  );
}
