// helper/progressReset.ts
import cron from "node-cron";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

// Schedule: Every Monday at 12:00 PM
cron.schedule("0 12 * * 1", async () => {
  try {
    console.log("⏰ Running Monday 12 PM Progress Reset...");

    await dbConnect();
    const users = await UserModel.find();

    for (const user of users) {
      user.progressData = user.progressData.map((data) => ({
        ...data,
        progress: 0,
      }));
      await user.save();
    }

    console.log("✅ Progress reset for all users");
  } catch (err) {
    console.error("❌ Cron Job Error:", err);
  }
});
