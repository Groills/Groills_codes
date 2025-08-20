"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useCopilotAction } from "@copilotkit/react-core";
import {
  ChevronDown,
  ChevronRight,
  Home,
  LineChart,
  Package,
  Video,
  Menu,
  Upload,
  Bell,
  Edit,
  User2,
  User,
} from "lucide-react";
import { SearchBar } from "@/components/Search";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  Area,
  Line,
  TooltipProps,
} from "recharts";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Video {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  video: string;
  user: string;
  views: number;
  createdAt: string;
  videoSkills: string[];
}

type ProgressItem = {
  day:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
  progress: number;
};

interface User {
  _id: number;
  watchedVideos: number;
  username: string;
  email: string;
  progressPercentage: number;
  progressData: ProgressItem[];
  video: Video[];
  profilePic: string;
}

interface ownerType {
  _id: string;
  username: string;
  profilePic: any;
}

type TooltipPayloadItem = {
  name: string;
  value: number | string;
  payload: any;
  dataKey: string | number;
  color: string;
};

type CustomTooltipProps = TooltipProps<number, string> & {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
};
type messageType = {
  id: string;
  read: boolean;
};
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  const uniquePayload = (payload as TooltipPayloadItem[]).reduce(
    (acc: TooltipPayloadItem[], item) => {
      if (!acc.some((i) => i.dataKey === item.dataKey)) {
        acc.push(item);
      }
      return acc;
    },
    []
  );

  return (
    <div className="rounded-md border bg-popover p-4 shadow-md">
      <p className="font-bold">{`Day: ${label}`}</p>
      <div className="mt-2 space-y-1">
        {uniquePayload.map((entry, index) => (
          <div
            key={`item-${index}`}
            className="flex items-center"
            style={{ color: entry.color }}
          >
            <div
              className="mr-2 h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="mr-2 font-medium">{entry.name}:</span>
            <span>{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [videos, setVideos] = useState<Video[]>([]);
  const { data: session } = useSession();
  const [owners, setOwners] = useState<ownerType[]>([]);
  const [currentUser, setCurrentUser] = useState<User>();
  const [CurrentUserVideos, setCurrentUserVideos] = useState<Video[]>([]);
  const [showXLabels, setShowXLabels] = useState(true);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [messages, setMessages] = useState<messageType[]>([]);
  const [loading, setLoading] = useState(true);

  const dummyProgressData = [
    { day: "Monday", progress: 0 },
    { day: "Tuesday", progress: 0 },
    { day: "Wednesday", progress: 0 },
    { day: "Thursday", progress: 0 },
    { day: "Friday", progress: 0 },
    { day: "Saturday", progress: 0 },
    { day: "Sunday", progress: 0 },
  ];
  const progressData = currentUser?.progressData?.length
    ? currentUser.progressData
    : dummyProgressData;

  // handling the search for videos
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsAnimating(true);

    if (!query.trim()) {
      setVideos([]);
      setTimeout(async () => {
        const response = await axios.post(`/api/get-videos-skills`, {
          username: session?.user?.username,
        });
        if (response.data.success) {
          setVideos(response.data.videos);
          setFilteredVideos([]);
        }
        setIsAnimating(false);
      }, 300);
      return;
    }

    const searchTerms = query
      .toLowerCase()
      .split(" ")
      .filter((term) => term.length > 0);

    const scoredVideos = videos.map((video) => {
      let score = 0;
      const titleMatch = video.title.toLowerCase();
      const descMatch = video.description.toLowerCase();

      if (titleMatch.includes(query.toLowerCase())) score += 50;
      searchTerms.forEach((term) => {
        if (titleMatch.includes(term)) score += 20;
        if (descMatch.includes(term)) score += 5;
      });

      if (descMatch.includes(query.toLowerCase())) score += 10;

      if (video.videoSkills) {
        video.videoSkills.forEach((skill) => {
          if (skill.toLowerCase().includes(query.toLowerCase())) score += 15;
          searchTerms.forEach((term) => {
            if (skill.toLowerCase().includes(term)) score += 7;
          });
        });
      }

      const owner = owners.find((o) => o._id === video.user);
      if (owner?.username.toLowerCase().includes(query.toLowerCase())) {
        score += 5;
      }

      return { ...video, score };
    });

    const filtered = scoredVideos
      .filter((video) => video.score > 0)
      .sort((a, b) => b.score - a.score);

    setFilteredVideos(filtered);

    setVideos([]);
    setTimeout(() => {
      const filteredIds = new Set(filtered.map((video) => video._id));
      const remainingVideos = videos.filter(
        (video) => !filteredIds.has(video._id)
      );
      setVideos([...filtered, ...remainingVideos]);
      setIsAnimating(false);
    }, 300);
  };

  useEffect(() => {
    async function getVideos() {
      try {
        if (!session?.user) return;

        const response = await axios.post(`/api/get-videos-skills`, {
          username: session?.user.username,
        });
        if (!response.data.success) {
          toast.error(response.data.message);
          return;
        }

        const fetchedVideos = response.data.videos;
        setVideos(fetchedVideos);

        const ownerResponses = await Promise.all(
          fetchedVideos.map((video: Video) =>
            axios.post(`/api/get-user-id`, { id: video.user })
          )
        );

        const allOwners = ownerResponses
          .filter((res) => res.data.success)
          .map((res) => res.data.user);

        setOwners(allOwners);

        const currentUserVideos = await axios.post(`/api/get-user-videos`, {
          id: session?.user._id,
        });
        if (!currentUserVideos.data.videos) {
          toast.error(response.data.message);
        }

        setCurrentUserVideos(currentUserVideos.data.videos);
      } catch (error) {
        console.log("Video fetching failed: ", error);
      } 
    }

    async function getCurrentUser() {
      try {
        if (session?.user?._id) {
          const user = await axios.post(`/api/get-user-id`, {
            id: session?.user._id,
          });
          if (user.data.success) {
            setCurrentUser(user.data.user);
          }
        }
      } catch (error) {
        console.log("User fetching failed: ", error);
      }
    }

    getVideos();
    getCurrentUser();
    setLoading(false)

    const handleResize = () => {
      setShowXLabels(window.innerWidth >= 727);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [session?.user?.username]);

  // getting the days ago for the videos
  function getDaysAgo(createdAt: string | Date): string {
    const createdDate = new Date(createdAt);
    const today = new Date();
    const diffTime = today.getTime() - createdDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  }

  // for using ai of copilort
  useCopilotAction({
    name: "findVideoByTitle",
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

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex min-h-screen w-full mt-13">
          {/* Sidebar Skeleton */}
          <div className="hidden border-r border-gray-700 bg-muted/40 md:block fixed h-screen w-[220px] lg:w-[280px] transition-all duration-300 ease-in-out">
            <div className="flex h-full flex-col gap-2">
              <div className="flex h-14 items-center border-b border-gray-700 px-4 lg:h-[60px] lg:px-6">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="ml-2 h-5 w-24" />
              </div>

              <div className="flex-1 overflow-y-auto py-4">
                <nav className="grid items-start gap-1 px-2 text-sm font-medium lg:px-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="px-3 py-2.5">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="flex flex-col w-full md:ml-[220px] lg:ml-[280px] transition-all duration-300 ease-in-out">
            {/* Header Skeleton */}
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-gray-700 bg-muted/40 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6">
              <Skeleton className="h-8 w-8 rounded-md md:hidden" />
              <div className="ml-auto flex items-center gap-4">
                <Skeleton className="h-8 w-24 rounded-md" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 lg:p-6">
              {/* Stats Cards Skeleton */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-gray-700 p-4"
                  >
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-4" />
                    </div>
                    <Skeleton className="mt-2 h-6 w-16" />
                    <Skeleton className="mt-1 h-3 w-32" />
                  </div>
                ))}
              </div>

              {/* Chart Section Skeleton */}
              <div className="mt-6">
                <Skeleton className="mx-auto h-8 w-64" />
                <div className="mt-6 rounded-lg border border-gray-700 p-4">
                  <div className="mb-4">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="mt-1 h-4 w-64" />
                  </div>
                  <Skeleton className="h-[350px] w-full" />
                  <div className="mt-4 flex justify-center gap-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center">
                        <Skeleton className="h-3 w-3 rounded-full" />
                        <Skeleton className="ml-2 h-3 w-20" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Videos Section Skeleton */}
              <div className="mt-6">
                <Skeleton className="mx-auto h-8 w-64" />

                {/* Search Bar Skeleton */}
                <Skeleton className="mt-4 h-10 w-full rounded-md" />

                {/* Video Grid Skeleton */}
                <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="rounded-xl overflow-hidden">
                      <Skeleton className="aspect-video w-full" />
                      <div className="mt-3 flex items-center space-x-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="mt-2 ml-11 h-3 w-24" />
                      <Skeleton className="mt-1 ml-11 h-3 w-36" />
                    </div>
                  ))}
                </div>

                <Skeleton className="mx-auto mt-5 h-4 w-64" />
              </div>
            </main>
          </div>
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex min-h-screen w-full mt-13">
        {/* Sidebar */}
        <div className="hidden border-r border-gray-700 bg-muted/40 md:block fixed h-screen w-[220px] lg:w-[280px] transition-all duration-300 ease-in-out">
          <div className="flex h-full flex-col gap-2">
            <div className="flex h-14 items-center border-b border-gray-700 px-4 lg:h-[60px] lg:px-6">
              <Link
                href="/"
                className="flex items-center gap-2 font-semibold text-muted-foreground transition-all hover:text-white group"
              >
                <Package className="h-6 w-6 text-purple-400 group-hover:rotate-12 transition-transform" />
                <span className="text-lg">Groills</span>
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              <nav className="grid items-start gap-1 px-2 text-sm font-medium lg:px-4">
                <div className="px-0">
                  <button
                    onClick={() => setDashboardOpen(!dashboardOpen)}
                    className="group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-gray-800 hover:text-purple-300 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Home className="h-4 w-4 text-purple-400 group-hover:scale-110 transition-transform" />
                      <span>Dashboard</span>
                    </div>
                    <span className="transition-transform duration-300">
                      {dashboardOpen ? (
                        <ChevronDown className="h-4 w-4 text-purple-400 transform group-hover:scale-125" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-purple-400 group-hover:translate-x-1" />
                      )}
                    </span>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ml-7 ${dashboardOpen ? "max-h-40 mt-1 opacity-100" : "max-h-0 opacity-0"}`}
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
        <div className="flex flex-col w-full md:ml-[220px] lg:ml-[280px] transition-all duration-300 ease-in-out">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-gray-700 bg-muted/40 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6">
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

          <main
            className="flex-1 overflow-y-auto p-4 lg:p-6"
            id="user-video-info"
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-200">
                    Total Videos Watched
                  </CardTitle>
                  <Video className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-400">
                    {currentUser?.watchedVideos ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground text-purple-200">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-200">
                    Learning Progress
                  </CardTitle>
                  <LineChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-400">
                    {(currentUser?.watchedVideos ?? 0) / 2}%
                  </div>
                  <Progress
                    value={(currentUser?.watchedVideos ?? 0) / 2}
                    className="h-2 mt-2"
                  />
                </CardContent>
              </Card>
            </div>

            <div className="mt-6">
              <h1 className="text-center text-xl sm:text-3xl font-bold mb-6 text-purple-200">
                Analytics Of Your Growth
              </h1>
              <Card className="bg-gradient-to-br from-muted/40 to-muted/40 border-0">
                <CardHeader>
                  <CardTitle className="text-xl text-white">
                    Weekly Progress
                  </CardTitle>
                  <CardDescription className="text-purple-200">
                    Your daily achievements this week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={progressData}
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      >
                        <defs>
                          <linearGradient
                            id="progressGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#8884d8"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#8884d8"
                              stopOpacity={0.2}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#6b46c1"
                          opacity={0.2}
                        />
                        {showXLabels && (
                          <XAxis
                            dataKey="day"
                            tick={{ fill: "#e9d5ff" }}
                            axisLine={{ stroke: "#a78bfa" }}
                          />
                        )}
                        <YAxis
                          tick={{ fill: "#e9d5ff" }}
                          axisLine={{ stroke: "#a78bfa" }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="progress"
                          fill="url(#progressGradient)"
                          stroke="#8884d8"
                          strokeWidth={2}
                          fillOpacity={1}
                        />
                        <Bar
                          dataKey="progress"
                          fill="rgba(168, 85, 247, 0.6)"
                          radius={[4, 4, 0, 0]}
                          barSize={20}
                        />
                        <Line
                          type="monotone"
                          dataKey="progress"
                          stroke="#f5d0fe"
                          strokeWidth={2}
                          dot={{ fill: "#c084fc", strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, fill: "#e879f9" }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="sm:flex sm:justify-center mt-4">
                    <div className="flex items-center mr-6">
                      <div className="w-3 h-3 bg-[#8884d8] rounded-full mr-2"></div>
                      <span className="text-sm text-purple-200">
                        Progress Trend
                      </span>
                    </div>
                    <div className="flex items-center mr-6">
                      <div className="w-3 h-3 bg-[#a855f7] rounded-full mr-2"></div>
                      <span className="text-sm text-purple-200">
                        Daily Progress
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-[#f5d0fe] rounded-full mr-2"></div>
                      <span className="text-sm text-purple-200">
                        Milestones
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div id="Video" className="mt-6">
              <h1 className="text-center text-xl sm:text-3xl font-bold mb-6 text-purple-200">
                All Videos For Your Learning
              </h1>

              {isAnimating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 flex items-center justify-center bg-black/10 z-50"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: "linear",
                    }}
                    className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
                  />
                </motion.div>
              )}

              {CurrentUserVideos.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <h2 className="text-lg sm:text-xl font-medium text-gray-500">
                    No videos uploaded yet. Upload your videos to start learning
                  </h2>
                  <Link
                    href="/upload-video"
                    className="mt-4 inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Upload Video
                  </Link>
                </motion.div>
              ) : videos.length === 0 && !isAnimating ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <h2 className="text-sm sm:text-2xl font-medium text-gray-500">
                    No videos uploaded yet according to your skills. Please
                    check after some days.
                  </h2>
                </motion.div>
              ) : (
                <div className="flex flex-col gap-8">
                  <SearchBar onSearch={handleSearch} />

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={searchQuery || "all-videos"}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-2 cursor-pointer"
                    >
                      <AnimatePresence>
                        {videos
                          .slice(0, CurrentUserVideos.length * 5)
                          .map((video, index) => {
                            const isFiltered =
                              searchQuery &&
                              filteredVideos.some((fv) => fv._id === video._id);
                            const owner = owners.find(
                              (o) => o._id === video.user
                            );

                            return (
                              <motion.div
                                key={video._id}
                                layout
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{
                                  opacity: 1,
                                  y: 0,
                                  scale: 1,
                                  transition: {
                                    type: "spring",
                                    stiffness: 100,
                                    damping: 10,
                                    delay: isAnimating ? index * 0.05 : 0,
                                  },
                                }}
                                exit={{ opacity: 0 }}
                                whileHover={{ y: -5 }}
                                className={`bg-muted/40 rounded sm:rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow p-3 sm:p-4 relative ${
                                  isFiltered ? "ring-2 ring-purple-500" : ""
                                }`}
                              >
                                {isFiltered && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full z-10"
                                  >
                                    Match
                                  </motion.div>
                                )}

                                {/* 🔄 Reverse Layout: side by side on mobile, stacked on sm+ */}
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
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-2 sm:p-3">
                                        <h3 className="text-white text-xs sm:text-sm font-medium line-clamp-2">
                                          {video.title}
                                        </h3>
                                      </div>
                                    </div>
                                  </Link>

                                  {/* Details */}
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3">
                                      {/* ✅ Profile pic hidden on mobile */}
                                      <Link
                                        href={`/user/profile/${owner?._id}`}
                                        className="hidden sm:block"
                                      >
                                        <Avatar className="h-8 w-8">
                                          <AvatarImage
                                            src={owner?.profilePic}
                                            alt={owner?.username}
                                          />
                                          <AvatarFallback>U</AvatarFallback>
                                        </Avatar>
                                      </Link>

                                      <Link href={`/video/${video._id}`}>
                                        <h3 className="text-white text-sm sm:text-base font-medium line-clamp-2">
                                          {video.title}
                                        </h3>
                                      </Link>
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:ml-11">
                                      {owner?.username}
                                    </p>
                                    <div className="flex justify-between items-center mt-1 sm:ml-11 text-xs sm:text-sm text-gray-400">
                                      <span>
                                        {video.views} views •{" "}
                                        {getDaysAgo(video.createdAt)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                      </AnimatePresence>
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
              <p className="text-center sm:font-bold text-purple-200 pt-5">
                Upload more videos to get more here.
              </p>
            </div>
          </main>
        </div>
      </div>
    </motion.div>
  );
}
