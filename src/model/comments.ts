import mongoose, { Schema } from "mongoose";

export interface Comments extends Document {
  text: String;
  videoId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  likes: Number;
}

const CommentSchema: Schema<Comments> = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    videoId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const CommentsModel =
  (mongoose.models.Comments as mongoose.Model<Comments>) ||
  mongoose.model<Comments>("Comments", CommentSchema);

export default CommentsModel;
