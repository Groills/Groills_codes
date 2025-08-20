import mongoose from "mongoose";

let isConnected: boolean = false;

async function dbConnect(): Promise<void> {
  if (isConnected) {
    console.log("Already connected to database");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGOURI as string);
    if (db) {
      isConnected = true;
      console.log("DB connected successfully");
    }
  } catch (error) {
    isConnected = false;
    console.log("DB found error: ", error);
    process.exit(1);
  }
}

export default dbConnect;
