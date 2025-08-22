import mongoose, { Schema, Document } from "mongoose";

// Define type for progress item
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

// Define the user document type
export interface User extends Document {
  email: string;
  password: string;
  username: string;
  verificationCode: string;
  verificationCodeExpiry: Date;
  skills: string[];
  WantedSkills: string[];
  isVerified: boolean;
  watchedVideos: number;
  progressData: ProgressItem[];
  profilePic: string;
}

// Create schema for progressData
const ProgressSchema: Schema<ProgressItem> = new Schema(
  {
    day: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      required: true,
    },
    progress: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  { _id: false } // prevents creating _id for each subdocument
);

// User schema
const UserSchema: Schema<User> = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please use a valid email"],
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    verificationCode: {
      type: String,
      required: true,
    },
    verificationCodeExpiry: {
      type: Date,
      required: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    WantedSkills: {
      type: [String],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    watchedVideos: {
      type: Number,
      default: 0,
    },
    progressData: {
      type: [ProgressSchema],
      default: [
        {day: "Monday", progress: 0},
        {day: "Tuesday", progress: 0},
        {day: "Wednesday", progress: 0},
        {day: "Thursday", progress: 0},
        {day: "Friday", progress: 0},
        {day: "Saturday", progress: 0},
        {day: "Sunday", progress: 0},
      ],
    },
    profilePic: {
      type: String,
    }
  },
  { timestamps: true }
);

// Model export
const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema);

export default UserModel;
