import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { usernameValidation } from "@/schemas/signupSchema";
import { z } from "zod";

const queryParamsSchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  await dbConnect();
  try {
    const url = new URL(request.url);
    const queryParams = {
      username: url.searchParams.get("username"),
    };

    const result = queryParamsSchema.safeParse(queryParams);
    if (!result.success) {
      const usernameError = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message: usernameError,
        },
        { status: 400 }
      );
    }

    const { username } = result.data;

    const existedUserbyUsername = await UserModel.findOne({
      username,
    });
    
    if (existedUserbyUsername) {
      return Response.json(
        {
          success: false,
          message: "Username had already taken",
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Username is available",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error while checking the username", error);
    return Response.json(
      {
        success: false,
        message: "Error while checking the username",
      },
      { status: 400 }
    );
  }
}
