import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { verifyCodeSchema } from "@/schemas/verifyCodeSchema";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { verifyOTP, username } = await request.json();
    const checkingVerificationCode = {
      verifyCode: verifyOTP,
    };
    
    const result = verifyCodeSchema.safeParse(checkingVerificationCode);
    if (!result.success) {
      const verifyCodeError = result.error.format().verifyCode?._errors;
      return Response.json(
        {
          success: false,
          message: "Error :" + verifyCodeError,
        },
        { status: 400 }
      );
    }
    const verificationCodeFromResult = result.data.verifyCode;

    const existedUserbyUsername = await UserModel.findOne({ username });
    console.log(existedUserbyUsername)
    if (!existedUserbyUsername) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 400 }
      );
    }
    const isCodeNotExpired = new Date(existedUserbyUsername.verificationCodeExpiry) > new Date();
    const isCodeValid = verificationCodeFromResult === existedUserbyUsername.verificationCode;

    if (isCodeValid && isCodeNotExpired) {
      existedUserbyUsername.isVerified = true;
      await existedUserbyUsername.save();
      return Response.json({
        success: true,
        message: "Verified successfully",
      }, { status: 200 });
    }

    if(!isCodeNotExpired){
        return Response.json({
            success: false,
            message: "Code is expired, Please signup again"
        }, { status: 400 })
    }
    if(!isCodeValid){
        return Response.json({
            success: false,
            message: "Code is invalid"
        }, { status: 400 })
    }
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Error while verifying the code" + Error,
      },
      { status: 500 }
    );
  }
}
