"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Head from "next/head";
import axios from "axios";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  Home,
  Video,
  Upload,
  LineChart,
  Menu,
  ChevronDown,
  ChevronRight,
  Bell,
  Edit,
  User2,
} from "lucide-react";
import { FiUser } from "react-icons/fi";
import { v4 as uuidv4 } from "uuid";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Video {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  video: string;
  user: string;
  views: number;
  createdAt: string;
  likes: number;
  duration: number;
  videoSkills: [string];
}

interface CommentType {
  _id: string;
  userId: string;
  likes: number;
  text: string;
  createdAt: string;
  profilePic: any;
}
interface owner {
  _id: string;
  username: string;
  profilePic: any;
}
type messageType = {
  id: string;
  read: boolean;
};
function formatDuration(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const paddedMins = mins.toString().padStart(2, "0");
  const paddedSecs = secs.toString().padStart(2, "0");

  return hrs > 0
    ? `${hrs}:${paddedMins}:${paddedSecs}`
    : `${mins}:${paddedSecs}`;
}

function getDaysAgo(createdAt: string | Date): string {
  const createdDate = new Date(createdAt);
  const today = new Date();

  const diffTime = today.getTime() - createdDate.getTime(); // in milliseconds
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}
const VideoPage = () => {
  const { id } = useParams();
  const [owner, setOwner] = useState<owner>();
  const [video, setVideo] = useState<Video>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const { data: session, status } = useSession();
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const router = useRouter();
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<owner>();
  const [messages, setMessages] = useState<messageType[]>([]);
  const meetingId = uuidv4();
  const [CurrentUserVideos, setCurrentUserVideos] = useState<Video[]>([]);
  // handling like
  const handleLike = async () => {
    try {
      if (isLiked) {
        const response = await axios.post(`/api/handle-like-dislike`, {
          type: "video",
          id: id,
          action: "dislike",
        });
        if (response.data.success) {
          console.log("New Likes:", response.data.likes);
          setVideo((prev) =>
            prev ? { ...prev, likes: response.data.likes } : prev
          );
          setIsLiked(false);
        }
      } else {
        const response = await axios.post(`/api/handle-like-dislike`, {
          type: "video",
          id: id,
          action: "like",
        });
        if (response.data.success) {
          console.log("New Likes:", response.data.likes);
          setVideo((prev) =>
            prev ? { ...prev, likes: response.data.likes } : prev
          );
          setIsLiked(true);
        }
      }
    } catch (error) {
      console.log("Error occurent while liking the video", error);
    }
  };

  // handling dislike
  const handleDislike = async () => {
    try {
      if (isDisliked) {
        const response = await axios.post(`/api/handle-like-dislike`, {
          type: "video",
          id: id,
          action: "like",
        });
        if (response.data.success) {
          console.log("New Likes:", response.data.likes);
          setVideo((prev) =>
            prev ? { ...prev, likes: response.data.likes } : prev
          );
          setIsDisliked(false);
        }
      } else {
        const response = await axios.post(`/api/handle-like-dislike`, {
          type: "video",
          id: id,
          action: "dislike",
        });
        if (response.data.success) {
          console.log("New Likes:", response.data.likes);
          setVideo((prev) =>
            prev ? { ...prev, likes: response.data.likes } : prev
          );
          setIsDisliked(true);
          setIsLiked(false);
        }
      }
    } catch (error) {
      console.log("Error occurent while liking the video", error);
    }
  };

  // Fetch video data
  useEffect(() => {
    if (!id || status !== "authenticated") return;
    const fetchVideo = async () => {
      try {
        const response = await axios.get(`/api/videos/${id}`);
        const fetchedVideo = response.data.video;
        setVideo(fetchedVideo);
        setLoading(false);

        const progressRes = await axios.post(
          `/api/get-user-progress`,
          {
            userId: session?.user._id,
          },
          { headers: { "Content-Type": "application/json" } }
        );

        if (progressRes.data.success) {
          console.log("today", progressRes.data.day);
          const currentProgress = progressRes.data.progress;
          progressRef.current = currentProgress;
          setProgress(currentProgress);
        }

        // 2. Get username using user ID from video
        if (fetchedVideo?.user) {
          const ownerResponse = await axios.post(`/api/get-user-id`, {
            id: fetchedVideo?.user,
          });
          if (ownerResponse.data.success) {
            setOwner(ownerResponse.data.user);

            // 3. Get comments of video
            const commentsResponse = await axios.get(`/api/comments/${id}`);
            if (commentsResponse.data.success) {
              setComments(commentsResponse.data.comments);
            }
            // 4. Get related videos by username
            const videosResponse = await axios.post(`/api/get-videos-skills`, {
              username: ownerResponse.data.owner,
            });

            if (videosResponse.data.success) {
              setVideos(videosResponse.data.videos);
            } else {
              toast.error(videosResponse.data.message);
            }
            const currentUserVideos = await axios.post(`/api/get-user-videos`, {
              id: session?.user._id,
            });
            if (!currentUserVideos.data.videos) {
              toast.error(response.data.message);
            }

            setCurrentUserVideos(currentUserVideos.data.videos);
          } else {
            toast.error(ownerResponse.data.message);
          }
          if (session?.user?._id) {
            const currentUserResponse = await axios.post("/api/get-user-id", {
              id: session?.user._id,
            });
            if (currentUserResponse.data.success) {
              setCurrentUser(currentUserResponse.data.user);
            }
          }
        }
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id, status, session]);

  // handle meeting submit
  const handlemeetingSubmit = async () => {
    // Step 1: Send request message to owner
    if (session?.user?._id && owner?._id && meetingId) {
      const messageResponse = await axios.post(`/api/add-message`, {
        text: "Would you like to join the video meeting now? Click 'Join' to enter the meeting, or choose 'Cancel' if you’re not ready yet.",
        ownerId: owner?._id,
        userId: session?.user._id,
        link: `/video-meet/${meetingId}`,
      });

      if (!messageResponse.data.success) {
        console.error("Failed to send message");
        return;
      }
      toast.success("Message sent to owner successfully");
      toast.success("Wait for some seconds asking owner to join the meeting.");
      // Step 2: Poll every 5 seconds for up to 60 seconds
      const pollInterval = 30000; // 30s
      const maxTime = 60000; // 120s
      const startTime = Date.now();

      const intervalId = setInterval(async () => {
        try {
          const response = await axios.post(`/api/get-message`, {
            ownerId: owner?._id,
            userId: session?.user._id,
          });

          if (
            response.data.success &&
            response.data.userMessage?.isAccepted !== undefined
          ) {
            clearInterval(intervalId);
            if (response.data.userMessage.isAccepted) {
              clearInterval(intervalId);
              alert("Joining Meeting, Message Accepted");
              router.replace(`${response.data.userMessage.link}`);
            } else {
              alert(
                "Your Meeting Request Is Rejected. The video owner doesn't have time."
              );
            }
          } else {
            const now = Date.now();
            if (now - startTime >= maxTime) {
              clearInterval(intervalId);
              alert("Meeting request timed out.");
            }
          }
        } catch (error) {
          console.error("Polling error:", error);
          clearInterval(intervalId);
        }
      }, pollInterval);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(`/api/videos/${id}/comments`, {
        text: newComment,
      });
      if (response.data.success) {
        setComments((prev) => [response.data.comment, ...prev]);
        toast.success(response.data.message);
      }
      setNewComment("");
    } catch (err) {
      console.error("Error submitting comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // video end handling
  async function handleVideoEnded() {
    const updatedProgress = progressRef.current + 5;
    progressRef.current = updatedProgress;
    setProgress(updatedProgress);

    try {
      const viewsResponse = await axios.post(`/api/videos/${id}/views`);
      if (viewsResponse.data.success) {
        setVideo((prev) =>
          prev ? { ...prev, views: viewsResponse.data.views } : prev
        );
      }

      const response = await axios.post(`/api/increase-watched-videos`, {
        id: session?.user._id,
      });

      if (response.data.success) {
        toast.success("Video watched successfully");
      }

      const updateProgress = await axios.post(`/api/update-progress`, {
        userId: session?.user._id,
        progress: updatedProgress,
      });

      if (updateProgress.data.success) {
        toast.success(updateProgress.data.message);
      }
    } catch (error) {
      console.log("Error in handleVideoEnded: ", error);
    }
  }
  const unreadCount = messages.filter((msg) => !msg.read).length;
  if (loading)
    return (
      <div className="flex pt-15">
        {/* Sidebar */}
        <div className="hidden md:block fixed h-screen w-[220px] lg:w-[280px] bg-gray-800/40 border-r" />

        {/* Main Content */}
        <div className="md:ml-[220px] lg:ml-[280px] w-full">
          {/* Header */}
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 text-white md:hidden"
                >
                  <Skeleton className="h-5 w-5 rounded-md" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetTitle>Main Navigation</SheetTitle>
                <div className="space-y-3 mt-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </SheetContent>
            </Sheet>
          </header>

          {/* Page Content */}
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Video Player and Info */}
              <div className="lg:w-3/4 space-y-6">
                <Skeleton className="w-full aspect-video rounded-xl" />

                <div className="space-y-4">
                  <Skeleton className="h-6 w-3/4" />

                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <Skeleton className="h-4 w-24" />
                  </div>

                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-16 rounded-full" />
                    <Skeleton className="h-8 w-16 rounded-full" />
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-800/50 p-4 rounded-xl space-y-3">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>

                {/* Comments */}
                <div className="space-y-6 mt-8">
                  <Skeleton className="h-6 w-40" />

                  <div className="flex space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <Skeleton className="h-10 w-full" />
                  </div>

                  <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="flex space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Related Videos */}
              <div className="lg:w-1/4 space-y-4">
                <Skeleton className="h-6 w-24" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="p-4 text-red-500 pt-15 text-3xl text-center">
        Error: {error}
      </div>
    );
  if (!video)
    return (
      <div className="flex pt-15">
        {/* Sidebar */}
        <div className="hidden md:block fixed h-screen w-[220px] lg:w-[280px] bg-gray-800/40 border-r" />

        {/* Main Content */}
        <div className="md:ml-[220px] lg:ml-[280px] w-full">
          {/* Header */}
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 text-white md:hidden"
                >
                  <Skeleton className="h-5 w-5 rounded-md" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetTitle>Main Navigation</SheetTitle>
                <div className="space-y-3 mt-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </SheetContent>
            </Sheet>
          </header>

          {/* Page Content */}
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Video Player and Info */}
              <div className="lg:w-3/4 space-y-6">
                <Skeleton className="w-full aspect-video rounded-xl" />

                <div className="space-y-4">
                  <Skeleton className="h-6 w-3/4" />

                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <Skeleton className="h-4 w-24" />
                  </div>

                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-16 rounded-full" />
                    <Skeleton className="h-8 w-16 rounded-full" />
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-800/50 p-4 rounded-xl space-y-3">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>

                {/* Comments */}
                <div className="space-y-6 mt-8">
                  <Skeleton className="h-6 w-40" />

                  <div className="flex space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <Skeleton className="h-10 w-full" />
                  </div>

                  <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="flex space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Related Videos */}
              <div className="lg:w-1/4 space-y-4">
                <Skeleton className="h-6 w-24" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  return (
    <div className="flex pt-15">
      {/* Sidebar */}
      <div className="hidden border-r border-gray-700 bg-muted/40 md:block fixed h-screen w-[220px] lg:w-[280px] transition-all duration-300 ease-in-out">
        <div className="flex h-full flex-col gap-2">
          {/* Logo/Brand */}
          <div className="flex h-14 items-center border-b border-gray-700 px-4 lg:h-[60px] lg:px-6">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold text-muted-foreground transition-all hover:text-white group"
            >
              <Package className="h-6 w-6 text-purple-400 group-hover:rotate-12 transition-transform" />
              <span className="text-lg">Groills</span>
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="grid items-start gap-1 px-2 text-sm font-medium lg:px-4">
              {/* Collapsible Dashboard menu */}
              <div className="px-0">
                <button
                  onClick={() => setDashboardOpen(!dashboardOpen)}
                  className="group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-gray-800 hover:text-purple-300 transition-all"
                >
                  <Link href={"/dashboard"}>
                    <div className="flex items-center gap-3">
                      <Home className="h-4 w-4 text-purple-400 group-hover:scale-110 transition-transform" />
                      <span>Dashboard</span>
                    </div>
                  </Link>
                  <span className="transition-transform duration-300">
                    {dashboardOpen ? (
                      <ChevronDown className="h-4 w-4 text-purple-400 transform group-hover:scale-125" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-purple-400 group-hover:translate-x-1" />
                    )}
                  </span>
                </button>

                {/* Animated Sub-links */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ml-7 ${
                    dashboardOpen
                      ? "max-h-40 mt-1 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="flex flex-col gap-2 pl-2 py-1 text-sm text-muted-foreground">
                    <Link
                      href="#Analytics"
                      className="hover:text-purple-300 transition-colors px-2 py-1.5 rounded hover:bg-gray-800/50 flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                      Watched Videos
                    </Link>
                    <Link
                      href="#Video"
                      className="hover:text-purple-300 transition-colors px-2 py-1.5 rounded hover:bg-gray-800/50 flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                      Wanted Videos
                    </Link>
                    <Link
                      href="#Analytics"
                      className="hover:text-purple-300 transition-colors px-2 py-1.5 rounded hover:bg-gray-800/50 flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                      Analytics
                    </Link>
                  </div>
                </div>
              </div>

              {/* Other Navigation Links */}
              <Link
                href="/user/videos"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all hover:bg-gray-800 hover:text-purple-300 group"
              >
                <User2 className="h-4 w-4 text-purple-400 group-hover:scale-110 transition-transform" />
                My Profile
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all hover:bg-gray-800 hover:text-purple-300 group"
              >
                <LineChart className="h-4 w-4 text-purple-400 group-hover:scale-110 transition-transform" />
                Analytics
              </Link>
              <Link
                href="/upload-video"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all hover:bg-gray-800 hover:text-purple-300 group"
              >
                <Upload className="h-4 w-4 text-purple-400 group-hover:scale-110 transition-transform" />
                Upload video
              </Link>
              <Link
                href="/edit-profile"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all hover:bg-gray-800 hover:text-purple-300 group"
              >
                <Edit className="h-4 w-4 text-purple-400 group-hover:scale-110 transition-transform" />
                Edit Profile
              </Link>
              <Link
                href="/user/messages"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all hover:bg-gray-800 hover:text-purple-300 group"
              >
                <Bell className="h-4 w-4 text-purple-400 group-hover:scale-110 transition-transform" />
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-auto bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-[220px] lg:ml-[280px] w-full">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-gray-700 bg-muted/40 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6">
          {/* Mobile Menu Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden bg-transparent border-gray-600 hover:bg-gray-800 hover:text-purple-300"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="flex flex-col bg-gray-900 border-r border-gray-700"
            >
              <SheetTitle className="sr-only">Main Navigation</SheetTitle>

              <nav className="grid gap-1 text-lg font-medium py-5 pl-5">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-lg font-semibold text-muted-foreground hover:text-white mb-6 group"
                >
                  <Package className="h-6 w-6 text-purple-400 group-hover:rotate-12 transition-transform" />
                  <span className="text-2xl font-bold">Groills</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all hover:bg-gray-800 hover:text-purple-300 group"
                >
                  <Home className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
                  Dashboard
                </Link>
                <Link
                  href="/user/videos"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all hover:bg-gray-800 hover:text-purple-300 group"
                >
                  <User2 className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
                  My Profile
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all hover:bg-gray-800 hover:text-purple-300 group"
                >
                  <LineChart className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
                  Analytics
                </Link>
                <Link
                  href="/upload-video"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all hover:bg-gray-800 hover:text-purple-300 group"
                >
                  <Upload className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
                  Upload Video
                </Link>
                <Link
                  href="/edit-profile"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all hover:bg-gray-800 hover:text-purple-300 group"
                >
                  <Edit className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
                  Edit profile
                </Link>
                <Link
                  href="/user/messages"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all hover:bg-gray-800 hover:text-purple-300 group"
                >
                  <Bell className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
                  Notification
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          {/* User Profile */}
          <div className="ml-auto flex flex-wrap items-center gap-4 sm:gap-6 md:gap-10 lg:gap-15">
            {/* AI Assistant */}
            <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md bg-black/5 hover:bg-black/10 transition">
              <div className="relative">
                <span className="absolute inset-0 rounded-full bg-purple-500 opacity-30 blur-md animate-ping"></span>
                <img
                  src="/ai_icon.png"
                  alt="AI Assistant"
                  className="h-8 w-8 sm:h-10 sm:w-10 relative z-10 drop-shadow-glow"
                />
              </div>
              <p className="hidden sm:block text-xs sm:text-sm font-semibold text-white glow-text tracking-wide">
                AI Assistant
              </p>
            </div>

            {/* Upload Video */}
            <Link href={"/upload-video"}>
              <button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-1 px-2 sm:py-1.5 sm:px-3 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-xs sm:text-sm shadow-lg hover:shadow-purple-500/20 flex items-center gap-1 sm:gap-1.5">
                <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Upload Video</span>
              </button>
            </Link>

            {/* User Avatar & Name */}
            <div className="flex items-center gap-3 sm:gap-4 md:gap-6 group cursor-pointer">
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8 transition-colors">
                <AvatarImage
                  src={currentUser?.profilePic}
                  alt={currentUser?.username}
                />
              </Avatar>
              <span className="hidden sm:inline text-xs sm:text-sm font-medium text-muted-foreground group-hover:text-white transition-colors">
                {session?.user.username}
              </span>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8">
          <Head>
            <title>{video.title} | MyVideoPlatform</title>
            <meta name="description" content={video.description} />
          </Head>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Video Section */}
            <div className="lg:w-3/4 space-y-6">
              {/* Video Player */}
              <div className="bg-gray-900 rounded-xl overflow-hidden aspect-video shadow-2xl border border-lg">
                <video
                  controls
                  autoPlay
                  className="w-full h-full "
                  poster={video.thumbnail}
                  onEnded={handleVideoEnded}
                >
                  <source src={video.video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Video Info */}
              <div className="mt-4 space-y-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {video.title}
                </h1>
                {/* // video skills  */}
                <div className="mt-6">
                  <p className="text-lg font-medium text-purple-400 mb-2">
                    Skills in the Video :
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {video.videoSkills.map((skill, index) => (
                      <li
                        key={index}
                        className="bg-purple-100 text-purple-800 px-3 py-1 text-sm rounded-full font-medium"
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <Link href={`/user/profile/${owner?._id}`}>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10 border border-gray-700">
                        <AvatarImage src={owner?.profilePic} alt="@username" />
                      </Avatar>
                      <span className="text-gray-300">{owner?.username}</span>
                    </div>
                  </Link>
                  <div className="flex space-x-2">
                    <button
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-colors ${
                        isLiked
                          ? "bg-purple-900/30 text-purple-400"
                          : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                      }`}
                      onClick={handleLike}
                    >
                      <ThumbsUpIcon className="w-4 h-4" />
                      <span className="text-sm">{video.likes}</span>
                    </button>
                    <button
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-colors ${
                        isDisliked
                          ? "bg-purple-900/30 text-purple-400"
                          : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                      }`}
                      onClick={handleDislike}
                    >
                      <ThumbsDownIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Video Description */}
              <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700/50">
                <div className="flex items-center space-x-3 text-sm text-gray-400 mb-3">
                  <span>{video.views.toLocaleString()} views</span>
                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                  <span>{getDaysAgo(video.createdAt)}</span>
                </div>
                <p className="text-gray-200 whitespace-pre-line leading-relaxed">
                  {video.description}
                </p>
                <button
                  onClick={handlemeetingSubmit}
                  className="bg-purple-500 hover:bg-purple-700 text-white font-semibold mt-2 py-1 px-4 rounded-xl shadow-md transition duration-300 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-purple-300"
                >
                  Start Meeting
                </button>
              </div>

              {/* Comments Section */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    {comments?.length || 0} Comments
                  </h2>
                </div>

                {/* Add Comment */}
                <div className="flex space-x-4 mb-8">
                  <Avatar className="h-10 w-10 border border-gray-700 flex-shrink-0">
                    <AvatarImage
                      src={owner?.profilePic}
                      alt={owner?.username}
                    />
                  </Avatar>
                  <form onSubmit={handleCommentSubmit} className="flex-1">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      className="w-full bg-transparent border-b border-gray-700 pb-2 focus:outline-none focus:border-purple-500 text-white placeholder-gray-500"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <div className="flex justify-end mt-3 space-x-3">
                      <button
                        type="button"
                        className="px-4 py-2 text-gray-400 hover:text-white rounded-full text-sm transition-colors"
                        onClick={() => setNewComment("")}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          newComment.trim()
                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                            : "bg-gray-700 text-gray-500 cursor-not-allowed"
                        }`}
                        disabled={!newComment.trim() || isSubmitting}
                      >
                        {isSubmitting ? "Commenting..." : "Comment"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Comments List */}
                <div className="space-y-6">
                  <CommentList comments={comments} />
                </div>
              </div>
            </div>

            {/* Sidebar - Related Videos */}
            <div className="lg:w-1/4">
              <div className="sticky top-4 space-y-4">
                <h3 className="font-semibold text-lg text-white pb-2 border-b border-gray-700">
                  Up next
                </h3>
                <div className="space-y-3">
                  {videos
                    .slice(0, CurrentUserVideos.length * 5)
                    .map((relatedVideo) => (
                      <Link
                        href={`/video/${relatedVideo._id}`}
                        key={relatedVideo._id}
                        className="block hover:scale-[1.02] transition-transform"
                      >
                        <RelatedVideoCard
                          video={relatedVideo}
                          currentVideoId={video._id}
                        />
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { ChevronDownIcon } from "lucide-react";
import { userAgent } from "next/server";

const CommentList = ({ comments }: { comments: CommentType[] }) => {
  const [showAll, setShowAll] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileVisible, setMobileVisible] = useState(false);

  useEffect(() => {
    // Check if the screen is mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile(); // Initial check
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const visibleComments = showAll ? comments : comments.slice(0, 4);

  return (
    <div className="space-y-2">
      {/* Show button on mobile when comments are hidden */}
      {isMobile && !mobileVisible && (
        <button
          className="mt-4 flex items-center text-sm text-gray-400 hover:text-purple-400 transition-colors"
          onClick={() => setMobileVisible(true)}
        >
          <ChevronDownIcon
            className={`w-4 h-4 mr-1 transition-transform ${
              showAll ? "rotate-180" : ""
            }`}
          />
          {showAll ? "Show less" : `Show ${comments.length - 4} more`}
        </button>
      )}

      {/* Comments shown based on mobile visibility or default (non-mobile) */}
      {(!isMobile || mobileVisible) && (
        <>
          {visibleComments.map((comment) => (
            <Comment key={comment._id} comment={comment} />
          ))}

          {comments.length > 4 && (
            <button
              className="mt-4 flex items-center text-sm text-gray-400 hover:text-purple-400 transition-colors"
              onClick={() => setShowAll((prev) => !prev)}
            >
              <ChevronDownIcon
                className={`w-4 h-4 mr-1 transition-transform ${
                  showAll ? "rotate-180" : ""
                }`}
              />
              {showAll ? "Show less" : `Show ${comments.length - 4} more`}
            </button>
          )}
        </>
      )}
    </div>
  );
};

const Comment = ({ comment }: { comment: CommentType }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [owner, setOwner] = useState<owner>();
  const [likes, setLikes] = useState(comment.likes || 0);

  const handleLike = async () => {
    try {
      const response = await axios.post(`/api/handle-like-dislike`, {
        type: "comment",
        id: comment._id,
        action: isLiked ? "dislike" : "like",
      });

      if (response.data.success) {
        if (isLiked) {
          setIsLiked(false);
          setLikes((prev) => Math.max(prev - 1, 0));
        } else {
          setIsLiked(true);
          setLikes((prev) => prev + 1);
          if (isDisliked) {
            setIsDisliked(false);
          }
        }
      }
    } catch (error) {
      console.log("Error liking comment", error);
    }
  };

  const handleDislike = async () => {
    try {
      const response = await axios.post(`/api/handle-like-dislike`, {
        type: "comment",
        id: comment._id,
        action: isDisliked ? "like" : "dislike",
      });

      if (response.data.success) {
        if (isDisliked) {
          setIsDisliked(false);
          // no likes update
        } else {
          setIsDisliked(true);
          if (isLiked) {
            setIsLiked(false);
            setLikes((prev) => Math.max(prev - 1, 0));
          }
        }
      }
    } catch (error) {
      console.log("Error disliking comment", error);
    }
  };

  useEffect(() => {
    async function getUsername() {
      try {
        const res = await axios.post(`/api/get-user-id`, {
          id: comment.userId,
        });

        if (res.data.success) {
          setOwner(res.data.user);
        }
      } catch (err) {
        console.log("Error fetching user", err);
      }
    }

    getUsername();
  }, [comment.userId]);

  return (
    <div className="group p-2 hover:bg-gray-800/30 rounded-lg transition-colors duration-200">
      <div className="flex space-x-4">
        <Avatar className="h-10 w-10 flex-shrink-0 border border-gray-700">
          <AvatarImage src={owner?.profilePic} alt={owner?.username} />
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h4 className="font-medium text-sm text-white">
              {owner?.username}
            </h4>
            <span className="text-xs text-gray-400">
              {getDaysAgo(comment.createdAt)}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-200 leading-relaxed">
            {comment.text}
          </p>
          <div className="flex items-center mt-3 space-x-6">
            <button
              className={`flex items-center space-x-1.5 text-sm ${
                isLiked ? "text-purple-400" : "text-gray-400"
              } hover:text-purple-400 transition-colors`}
              onClick={handleLike}
            >
              <ThumbsUpIcon className="w-4 h-4" />
              <span>{likes}</span>
            </button>
            <button
              className={`flex items-center space-x-1.5 text-sm ${
                isDisliked ? "text-purple-400" : "text-gray-400"
              } hover:text-purple-400 transition-colors`}
              onClick={handleDislike}
            >
              <ThumbsDownIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Related Video Card Component
import React from "react";

const RelatedVideoCard = ({
  video,
  currentVideoId,
}: {
  video: Video;
  currentVideoId: string;
}) => {
  if (video._id === currentVideoId) return null;

  return (
    <>
      {/* Mobile layout (<sm) */}
      <div className="flex sm:hidden flex-row space-x-3 p-3 rounded sm:rounded-xl bg-gray-800/40 hover:bg-gray-700/50 transition-all duration-200 cursor-pointer group">
        {/* Thumbnail */}
        <div className="w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 relative shadow-md">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[11px] px-1 rounded">
            {formatDuration(video.duration)}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <h4 className="text-[12px] line-clamp-2 text-white group-hover:text-purple-300 transition-colors">
            {video.title}
          </h4>
          <div className="flex flex-wrap items-center mt-1 space-x-2 text-[11px] text-gray-400">
            <p>{video.views.toLocaleString()} views</p>
            <span className="text-gray-600">•</span>
            <p>{getDaysAgo(video.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Big screen layout (>=sm) → unchanged */}
      <div className="hidden sm:flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 p-3 rounded-xl bg-gray-800/40 hover:bg-gray-700/50 transition-all duration-200 cursor-pointer group">
        {/* Thumbnail */}
        <div className="w-full sm:w-40 h-48 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 relative shadow-md">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute bottom-1 right-1 bg-black/80 text-white text-sm px-1 rounded">
            {formatDuration(video.duration)}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <h4 className="text-[13px] line-clamp-2 text-white group-hover:text-purple-300 transition-colors">
            {video.title}
          </h4>
          <div className="flex flex-wrap items-center mt-1 space-x-2 text-xs text-gray-400">
            <p>{video.views.toLocaleString()} views</p>
            <span className="hidden sm:inline text-gray-600">•</span>
            <p>{getDaysAgo(video.createdAt)}</p>
          </div>
        </div>
      </div>
    </>
  );
};

// Icons
const ThumbsUpIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
    />
  </svg>
);

const ThumbsDownIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.017c.163 0 .326.02.485.06L17 4m0 0v9m0-9h2.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0118.263 15H17m0 0v5M7 11h3m0 0H7m3 0v5"
    />
  </svg>
);

const SortIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
    />
  </svg>
);

export default VideoPage;
