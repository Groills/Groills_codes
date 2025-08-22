"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
export default function VideoMeeting() {
  const { data: session, status: sessionStatus } = useSession();
  const containerRef = useRef<HTMLDivElement>(null);
  const zpRef = useRef<ZegoUIKitPrebuilt | null>(null);
  const router = useRouter();
  const params = useParams();
  const roomId = Array.isArray(params.roomId)
    ? params.roomId[0]
    : params.roomId;

  const [meetingStatus, setMeetingStatus] = useState<
    "init" | "joining" | "joined" | "error"
  >("init");
  const [error, setError] = useState("");
  const showMeetingUI = true;
  const [sdkLoaded, setSdkLoaded] = useState(false);

  // Load the SDK
  useEffect(() => {
    const loadSDK = async () => {
      try {
        await import("@zegocloud/zego-uikit-prebuilt");
        setSdkLoaded(true);
      } catch (err) {
        console.error("Failed to load Zego SDK:", err);
        setError("Failed to load video components");
        setMeetingStatus("error");
      }
    };

    loadSDK();
  }, []);

  // Start the meeting
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    if (sessionStatus !== "authenticated" || !roomId || !sdkLoaded) return;

    const startMeeting = async () => {
      if (!containerRef.current) {
        console.warn("containerRef is not ready yet.");
        return;
      }

      try {
        setMeetingStatus("joining");
        setError("");

        const { ZegoUIKitPrebuilt } = await import(
          "@zegocloud/zego-uikit-prebuilt"
        );

        const userID = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const userName = session?.user?.username || "Guest";

        const appID = Number(process.env.NEXT_PUBLIC_ZEGOAPP_ID);
        const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET;

        if (!appID || !serverSecret) {
          throw new Error("ZEGO App ID or Server Secret not provided");
        }

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          roomId,
          userID,
          userName
        );

        if (zpRef.current) {
          zpRef.current.destroy();
          zpRef.current = null;
        }

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zpRef.current = zp;

        timeoutId = setTimeout(() => {
          if (mounted && meetingStatus !== "joined") {
            setError("Connection timeout");
            setMeetingStatus("error");
            if (zpRef.current) {
              zpRef.current.destroy();
              zpRef.current = null;
            }
          }
        }, 15000);
        console.log("containerRef.current:", containerRef.current);
        console.log("ZegoUIKitPrebuilt:", ZegoUIKitPrebuilt);
        if (!containerRef.current) {
          console.warn("container is required");
          return;
        }
        zp.joinRoom({
          container: containerRef.current,
          scenario: { mode: ZegoUIKitPrebuilt.VideoConference },
          showPreJoinView: false,
          turnOnMicrophoneWhenJoining: true,
          turnOnCameraWhenJoining: false,
          onJoinRoom: () => {
            clearTimeout(timeoutId);
            if (mounted) setMeetingStatus("joined");
          },
          onLeaveRoom: () => {
            setTimeout(() => {
              if (zpRef.current) {
                try {
                  zpRef.current.destroy();
                } catch (err) {
                  console.warn("Zego destroy error:", err);
                }
                zpRef.current = null;
              }

              router.push("/dashboard");
            }, 1000);
          },
        });
      } catch (err) {
        console.error("Meeting init error:", err);
        if(err instanceof Error){
          setError(err.message || "Failed to join meeting");
        }
        setMeetingStatus("error");
        if (zpRef.current) {
          zpRef.current.destroy();
          zpRef.current = null;
        }
      }
    };

    const delayInit = setTimeout(() => {
      if (mounted) startMeeting();
    }, 100);

    return () => {
      mounted = false;
      clearTimeout(delayInit);
      clearTimeout(timeoutId);
      if (zpRef.current) {
        zpRef.current.destroy();
        zpRef.current = null;
      }
    };
  }, [sessionStatus, roomId, sdkLoaded]);

  return (
    <div className="relative h-screen w-full bg-black">
      {/* containerRef is always mounted */}
      <div
        ref={containerRef}
        className={`absolute inset-0 z-0 bg-black ${!showMeetingUI ? "hidden" : ""}`}
      />

      {(meetingStatus === "init" || meetingStatus === "joining") && (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 z-10 relative">
          <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-white text-lg">
            {meetingStatus === "init"
              ? "Preparing meeting..."
              : "Joining room..."}
          </p>
          <p className="mt-2 text-gray-400 text-sm">Room ID: {roomId}</p>
        </div>
      )}

      {meetingStatus === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-20">
          <div className="bg-red-500 text-white p-6 rounded-lg max-w-md text-center">
            <h2 className="text-xl font-bold mb-2">Meeting Error</h2>
            <p className="mb-4">{error}</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 bg-white text-red-500 rounded hover:bg-gray-100 transition"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
