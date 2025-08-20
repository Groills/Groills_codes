"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Link from "next/link";
import { toast } from "sonner";
import {
  Bell,
  CalendarIcon,
  ChevronDown,
  ChevronRight,
  Edit,
  Home,
  LineChart,
  Menu,
  Package,
  StarIcon,
  ThumbsUp,
  Upload,
  User2,
  Video,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCopilotAction } from "@copilotkit/react-core";
import { useSession } from "next-auth/react";
import { AvatarImage, Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

interface Video {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  video: string;
  views: number;
  duration: number;
  createdAt: string;
  likes: number;
}
interface owner {
  _id: string;
  username: string;
  profilePic: any;
  createdAt: string;
}
type messageType = {
  id: string;
  read: boolean;
};

const UserVideosPage = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [owner, setOwner] = useState<owner>();
  const { data: session, status } = useSession();
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [messages, setMessages] = useState<messageType[]>([]);
  const [currentUser, setCurrentUser] = useState<owner>();

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
  useEffect(() => {
    // fetching video and going on for fetching inside also
    const fetchVideos = async () => {
      try {
        if (session?.user._id) {
          const response = await axios.post("/api/get-user-videos", {
            id: session?.user._id,
          });
          setVideos(response.data.videos);
          const ownerResponse = await axios.post(`/api/get-user-id`, {
            id: session?.user._id,
          });
          if (!ownerResponse.data.success) {
            console.log("Error while getting user by his id");
          }
          setOwner(ownerResponse.data.user);
          if (session?.user._id) {
            const currentUser = await axios.post(`/api/get-user-id`, {
              id: session?.user._id,
            });
            if (response.data.success) setCurrentUser(currentUser.data.user);
            console.log(currentUser);
          }
        }
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [session]);
  // function for deleting videos
  const handleDeleteVideo = async (id: string) => {
    try {
      const response = await axios.post(`/api/delete`, { id, model: "Video" });
      if (response.data.success) {
        toast.success(response.data.message);
        const videoResponse = await axios.post("/api/get-user-videos", {
          id: session?.user._id,
        });
        setVideos(videoResponse.data.videos);
      }
    } catch (error) {
      toast.error("Error: " + error);
    }
  };
  // for getting day's ago
  function getDaysAgo(createdAt: string | Date): string {
    const createdDate = new Date(createdAt);
    const today = new Date();

    const diffTime = today.getTime() - createdDate.getTime(); // in milliseconds
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  }
  // copilot ai configuration
  useCopilotAction({
    name: "findUserVideoByTitle",
    description: "Find a video by its title from the list",
    parameters: [
      {
        name: "videoTitle",
        type: "string",
        description: "The title of the video to find",
        required: true,
      },
    ],
    handler: async ({ videoTitle }) => {
      const queryWords = videoTitle.toLowerCase().split(" ").filter(Boolean);

      const matchedVideos = videos.filter((v) =>
        queryWords.some((word) => v.title.toLowerCase().includes(word))
      );

      if (matchedVideos.length > 0) {
        // Move matched videos to the top (maintain order)
        const reordered = [
          ...matchedVideos,
          ...videos.filter((v) => !matchedVideos.includes(v)),
        ];
        setVideos(reordered);

        return {
          success: true,
          message: `✅ Found and moved video to the top.`,
        };
      } else {
        return {
          success: false,
          message: `❌ Couldn't find a video matching "${videoTitle}".`,
        };
      }
    },
  });

  const unreadCount = messages.filter((msg) => !msg.read).length;
  if (status === "loading" || loading || !currentUser) {
    return (
      <div className="flex flex-col h-screen bg-black text-white">
        {/* Sidebar Skeleton - Fixed position */}
        <div className="hidden md:block fixed h-screen w-[220px] lg:w-[280px] border-r border-gray-700 bg-gray-900/50">
          <div className="flex h-full flex-col gap-2">
            {/* Logo/Brand Skeleton */}
            <div className="flex h-14 items-center border-b border-gray-700 px-4 lg:h-[60px] lg:px-6">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full bg-gray-700" />
                <Skeleton className="h-4 w-20 rounded bg-gray-700" />
              </div>
            </div>

            {/* Navigation Skeleton */}
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="grid items-start gap-1 px-2 text-sm font-medium lg:px-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                    <Skeleton className="h-4 w-4 rounded-full bg-gray-700" />
                    <Skeleton className="h-4 w-24 rounded bg-gray-700" />
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content Area - Offset for sidebar */}
        <div className="md:ml-[220px] lg:ml-[280px] flex-1 overflow-auto">
          {/* Header Skeleton */}
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6">
            <Skeleton className="md:hidden h-8 w-8 rounded bg-gray-700" />
            <div className="ml-auto flex items-center gap-4">
              <Skeleton className="h-8 w-32 rounded-md bg-gray-700" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full bg-gray-700" />
                <Skeleton className="h-4 w-20 rounded bg-gray-700" />
              </div>
            </div>
          </header>

          {/* Profile Section Skeleton */}
          <div className="bg-black text-white">
            {/* Cover Photo Skeleton */}
            <div className="relative h-28 sm:h-38 bg-gray-800">
              <div className="absolute inset-0 bg-black/30"></div>
            </div>

            {/* Profile Content Skeleton */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Profile Picture Skeleton */}
                <div className="relative">
                  <Skeleton className="w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-gray-700 bg-gray-800" />
                </div>

                {/* Profile Info Skeleton */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-48 rounded bg-gray-800" />
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-4 w-32 rounded bg-gray-800" />
                        <Skeleton className="h-4 w-4 rounded-full bg-gray-800" />
                        <Skeleton className="h-4 w-28 rounded bg-gray-800" />
                      </div>
                    </div>
                    <Skeleton className="h-10 w-32 rounded-lg bg-gray-800" />
                  </div>

                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full rounded bg-gray-800" />
                    <Skeleton className="h-4 w-4/5 rounded bg-gray-800" />
                    <Skeleton className="h-4 w-3/4 rounded bg-gray-800" />
                  </div>

                  <div className="flex space-x-4">
                    <Skeleton className="h-10 w-32 rounded-lg bg-gray-800" />
                    <Skeleton className="h-10 w-32 rounded-lg bg-gray-800" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Video Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 sm:p-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-900/50 rounded-xl overflow-hidden"
              >
                <Skeleton className="aspect-video w-full rounded-t-lg bg-gray-800" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-full rounded bg-gray-800" />
                  <Skeleton className="h-3 w-3/4 rounded bg-gray-800" />
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-24 rounded bg-gray-800" />
                    <Skeleton className="h-3 w-12 rounded bg-gray-800" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-screen bg-black text-gray-800 mt-13">
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
                      href="/dashboard"
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
      <div className="flex-1 overflow-auto md:ml-[220px] lg:ml-[280px]">
        <main>
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
                  <Menu className="h-5 w-5 text-white" />
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
          <div className="bg-black text-white mb-10">
            {/* Cover Photo */}
            <div className="relative h-28 sm:h-38 bg-gradient-to-r from-gray-800 to-gray-900">
              <div className="absolute inset-0 bg-black/30"></div>
            </div>

            {/* Profile Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Profile Picture */}
                <div className="relative group">
                  <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-muted/100 overflow-hidden shadow-xl ring-1 ring-muted/30 transition-all duration-500">
                    {currentUser?.profilePic ? (
                      <img
                        src={currentUser.profilePic}
                        alt={session?.user.username ?? ""}
                        width={176}
                        height={176}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-900 to-pink-800 flex items-center justify-center">
                        <span className="text-4xl text-white font-bold">
                          {session?.user.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-black/30 rounded-full"></div>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold bg-white bg-clip-text text-transparent animate-gradient">
                        {session?.user.username}
                      </h1>
                      <div className="flex items-center mt-2 space-x-3">
                        <p className="text-gray-400 text-sm flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {new Date(
                            currentUser?.createdAt ?? ""
                          ).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        <span className="text-gray-600">•</span>
                        <div className="flex items-center text-sm text-purple-300">
                          <StarIcon className="h-4 w-4 mr-1" />
                          Premium Member
                        </div>
                      </div>
                    </div>
                    <Link href="#all-videos">
                      <button className="px-6 py-2 border border-gray-100 dark:text-white text-white rounded-lg font-bold transform hover:-translate-y-1 transition duration-400">
                        Watch Videos
                      </button>
                    </Link>
                  </div>

                  <p className="mt-4 text-gray-300 max-w-lg text-lg leading-relaxed">
                    Growing with Groills 🌱 | Uploading focused, skill-packed
                    videos to help us all win | No fluff, just progress | Join
                    the learning revolution!
                  </p>

                  <div className="mt-6 flex space-x-4">
                    <div className="bg-gray-800/50 backdrop-blur-sm px-10 py-1 rounded-lg border border-gray-700 hover:border-purple-500 flex gap-3 items-center transition-colors">
                      <span className="block text-xs text-gray-400">
                        Videos :
                      </span>
                      <span className="text-lg font-semibold text-purple-300">
                        {videos.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <hr />
          {videos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <h2 className="text-2xl font-medium text-gray-500">
                No videos uploaded yet
              </h2>
              <Link
                href="/upload-video"
                className="mt-4 inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Upload Your First Video
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              id="all-videos"
            >
              {videos.map((video) => (
                <motion.div
                  key={video._id}
                  whileHover={{ y: -5 }}
                  className="bg-muted/40 rounded sm:rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow mx-2 sm:ml-5 p-3 sm:p-4 mt-5"
                >
                  
                  <div className="flex flex-row sm:flex-col gap-3">
                    {/* Thumbnail */}
                    <Link
                      href={`/video/${video._id}`}
                      className="flex-shrink-0"
                    >
                      <div className="relative w-32 h-20 sm:aspect-video sm:w-full sm:h-auto">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs sm:text-sm px-1 rounded">
                          {formatDuration(video.duration)}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-2 sm:p-4">
                          <h3 className="text-white text-xs sm:text-sm font-medium line-clamp-2">
                            {video.title}
                          </h3>
                        </div>
                      </div>
                    </Link>

                    {/* Details */}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-700 text-sm sm:text-base truncate">
                        {video.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        {video.description?.split(" ").slice(0, 10).join(" ")}
                        {video.description?.split(" ").length > 10 && " ..."}
                      </p>

                      <div className="flex justify-between items-center mt-2 sm:mt-3 text-xs sm:text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <span>{video?.views?.toLocaleString()} views</span>
                          <span>•</span>
                          <span>{getDaysAgo(video.createdAt)}</span>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <ThumbsUp className="h-3 w-3 text-gray-400 fill-gray-400" />
                            <span>{video?.likes}</span>
                          </span>
                        </div>
                        <button
                          className="transition-all hover:text-red-400"
                          onClick={() => handleDeleteVideo(video._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserVideosPage;
