import mongoose, { Schema, Document } from "mongoose";

export interface Video extends Document {
  user: mongoose.Schema.Types.ObjectId;
  title: string;
  description: string;
  video: string;
  thumbnail: string;
  videoType: string;
  videoSkills: [string];
  views: number;
  likes: number;
  etag: string;
  duration: number;
}

const VideoSchema: Schema<Video> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    video: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    videoSkills: [String],
    videoType: {
      type: String,
      default: "all",
    },
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    etag: {
      type: String,
      required: true
    },
    duration: {
      type: Number
    }
  },
  { timestamps: true }
);

const VideoModel =
  (mongoose.models.Video as mongoose.Model<Video>) ||
  mongoose.model<Video>("Video", VideoSchema);

export default VideoModel;
