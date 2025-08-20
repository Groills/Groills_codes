"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Home,
  ChevronDown,
  ChevronRight,
  LineChart,
  Upload,
  Bell,
  Mail,
  X,
  Menu,
  Mic,
  MicOff,
  Edit,
  User2,
} from "lucide-react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Message {
  _id: string;
  text: string;
  isAccepted: boolean;
  link: string;
  createdAt: string;
  userId: string;
  owner: {
    username: string;
    email: string;
  };
}
interface ownerType {
  _id: string;
  username: string;
  profilePic: any;
}
const MessageScreen = () => {
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const { data: session } = useSession();
  const [currentUser, setCurrentUser] = useState<ownerType>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<Message>();
  const [owner, setOwner] = useState<ownerType>();
  const [loading, setLoading] = useState(true);

  async function getUser() {
    if (session?.user?._id) {
      const response = await axios.post(`/api/get-user-id`, {
        id: session?.user?._id,
      });
      if (response.data.success) {
        setCurrentUser(response.data.user);
        console.log("User found successfully");
      }
    }
  }
  async function getMessages() {
    const messagesResponse = await axios.get(`/api/get-messages`);
    if (messagesResponse.data.success) {
      const parsedMessages = messagesResponse.data.messages;
      const messageWithOwners = await Promise.all(
        parsedMessages.map(async (msg: Message) => {
          if (msg.userId) {
            const res = await axios.post(`/api/get-user-id`, {
              id: msg.userId,
            });
            setOwner(res.data.user);
            return {
              ...msg,
              owner: res.data.success ? res.data.user : null,
            };
          }
          return msg;
        })
      );
      setMessages(messageWithOwners);
    }
  }
  async function getMessage() {
    const ownerId = session?.user?._id;
    const userId = owner?._id;

    if (!ownerId || !userId) return;

    try {
      const { data } = await axios.post("/api/get-message", {
        ownerId,
        userId,
      });

      if (data?.success) {
        setMessage(data.userMessage);
        console.log("✅ Message retrieved successfully.");
      } else {
        console.warn("⚠️ Message fetch succeeded but returned no data.");
      }
    } catch (error) {
      console.error("❌ Failed to fetch message:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getUser();
    getMessages();
  }, [session]);

  useEffect(() => {
    if (session?.user?._id && owner?._id) {
      getMessage();
    }
  }, [owner]);

  const deleteMessage = async (id: string) => {
    setMessages(messages.filter((msg) => msg._id !== id));
    await axios.post(`/api/delete`, { id, model: "Message" });
  };

  const unreadCount = messages.filter((msg) => !msg.isAccepted).length;

  const handleJoinMeeting = async (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === messageId ? { ...msg, isAccepted: true } : msg
      )
    );
    if (message) {
      const acceptMessageResponse = await axios.post(`/api/accept-message`, {
        message: message,
      });
      if (acceptMessageResponse.data.success) {
        toast.success("Message accepted successfully");
      } else {
        console.log("Error while accepting message");
      }
    }
  };

  const handleRejectMeeting = async () => {
    toast.message("Message rejected");
  };
  function getDaysAgo(createdAt: string | Date): string {
    const createdDate = new Date(createdAt);
    const today = new Date();

    const diffTime = today.getTime() - createdDate.getTime(); // in milliseconds
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  }
  if (loading) {
    return (
      <div className="flex h-screen bg-black pt-14">
        {/* Sidebar Skeleton */}
        <div className="hidden border-r border-gray-700 bg-muted/40 md:block fixed h-screen w-[220px] lg:w-[280px] transition-all duration-300 ease-in-out">
          <div className="flex h-full flex-col gap-2">
            {/* Logo/Brand Skeleton */}
            <div className="flex h-14 items-center border-b border-gray-700 px-4 lg:h-[60px] lg:px-6">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
            </div>

            {/* Navigation Skeleton */}
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="grid items-start gap-1 px-2 text-sm font-medium lg:px-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-24 rounded" />
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="md:ml-[220px] lg:ml-[280px] flex-1">
          {/* Header Skeleton */}
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-gray-700 bg-muted/40 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6">
            <Skeleton className="md:hidden h-8 w-8 rounded" />
            <div className="ml-auto flex items-center gap-4">
              <Skeleton className="h-8 w-32 rounded-md" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
            </div>
          </header>

          {/* Notifications Content Skeleton */}
          <div className="max-w-4xl mx-auto pt-6 p-3">
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-7 w-40 rounded" />
              <Skeleton className="h-5 w-28 rounded" />
            </div>

            {/* Notifications List Skeleton */}
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide pr-2 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg border border-gray-700 bg-gray-800/30 shadow-sm relative w-full"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    {/* Left Side */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Skeleton className="mt-1 p-2 rounded-full h-8 w-8" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4 rounded" />
                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                          <Skeleton className="h-3 w-24 rounded" />
                          <Skeleton className="h-3 w-32 rounded" />
                        </div>
                        <Skeleton className="h-3 w-full rounded" />
                        <Skeleton className="h-3 w-5/6 rounded" />
                      </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-6 rounded-full" />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-3">
                    <Skeleton className="h-8 w-32 rounded-md" />
                    <Skeleton className="h-8 w-32 rounded-md" />
                  </div>

                  {/* Time */}
                  <Skeleton className="absolute bottom-2 right-2 h-3 w-16 rounded" />
                </div>
              ))}

              {/* Empty State Skeleton (shown when no notifications) */}
              <div className="text-center py-12">
                <Skeleton className="mx-auto h-12 w-12 rounded-full mb-4" />
                <Skeleton className="h-5 w-48 rounded mx-auto" />
                <Skeleton className="h-4 w-32 rounded mx-auto mt-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-screen bg-black pt-14">
      {/* Your existing sidebar */}
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
                <Edit className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
                Edit profile
              </Link>
              <Link
                href="/user/messages"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-purple-300 bg-gray-800 transition-all group"
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

      {/* Main content area */}
      <div className="md:ml-[220px] lg:ml-[280px] flex-1 ">
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
                  href="/dashbaord"
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
                  <Edit className="h-4 w-4 text-purple-400 group-hover:scale-110 transition-transform" />
                  Edit Profile
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
        <div className="max-w-4xl mx-auto pt-6 p-3">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
              Mark all as read
            </button>
          </div>

          <div className="max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide pr-2 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className={`p-4 rounded-lg border ${
                    message.isAccepted
                      ? "border-gray-700 bg-gray-800/30"
                      : "border-purple-500/30 bg-gray-800/50"
                  } shadow-sm relative w-full`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    {/* LEFT SIDE */}
                    <div className="flex items-start gap-3 flex-wrap">
                      <div className="mt-1 p-2 rounded-full bg-purple-500/10">
                        <Mail className="h-4 w-4 text-purple-400" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-medium text-white inline-block">
                          Join Meeting
                        </h3>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mt-1 text-gray-500">
                          <p className="break-all">{message?.owner.username}</p>
                          <p className="break-all">{message?.owner.email}</p>
                        </div>

                        <p className="text-sm text-muted-foreground mt-1 break-words">
                          {message.text}
                        </p>
                      </div>
                    </div>

                    {/* DELETE BUTTON */}
                    <div className="flex gap-2 self-end sm:self-start">
                      <button
                        onClick={() => deleteMessage(message._id)}
                        className="p-1.5 rounded-full hover:bg-gray-700 transition-colors"
                        title="Delete"
                      >
                        <X className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                  {/* Meeting Buttons  */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* join meeting  */}
                    <Link href={message.link}>
                      <button
                        className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-medium py-1 px-3 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-sm shadow-lg hover:shadow-purple-500/20 flex items-center gap-1.5 mt-3 ml-0 sm:ml-0"
                        onClick={(e) => handleJoinMeeting(message._id)}
                      >
                        <Mic className="h-4 w-4" />
                        <span>Join Meeting</span>
                      </button>
                    </Link>
                    {/* // reject button  */}
                    <div>
                      <button
                        className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-medium py-1 px-3 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-sm shadow-lg hover:shadow-purple-500/20 flex items-center gap-1.5 mt-3 ml-0 sm:ml-0"
                        onClick={handleRejectMeeting}
                      >
                        <MicOff className="h-4 w-4" />
                        <span>Reject Meeting</span>
                      </button>
                    </div>
                  </div>

                  {/* TIME AT BOTTOM-RIGHT */}
                  <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 text-gray-500 text-[10px] sm:text-sm flex flex-col sm:flex-row gap-1 sm:gap-3">
                    <p>
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                    <p>{getDaysAgo(message.createdAt)}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* NO NOTIFICATIONS */}
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Mail className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-400">
                  No notifications
                </h3>
                <p className="text-gray-500 mt-1">You're all caught up!</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageScreen;
