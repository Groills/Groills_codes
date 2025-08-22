import mongoose, { Schema } from "mongoose";

export interface Message extends Document {
  text: string;
  userId: Schema.Types.ObjectId;
  ownerId: Schema.Types.ObjectId;
  isAccepted: boolean;
  link: string;
}

const MessageSchema: Schema<Message> = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    }, 
    ownerId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    isAccepted: {
      type: Boolean,
      default: false
    },
    link: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

const MessageModel =
  (mongoose.models.Messages as mongoose.Model<Message>) ||
  mongoose.model<Message>("Messages", MessageSchema);

export default MessageModel;
