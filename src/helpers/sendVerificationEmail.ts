import { resend } from "@/lib/resend";
import { EmailTemplate } from "../../emails/EmailTemplete";

export async function sendVerificationEmail(
  email: string,
  username: string,
  otp: string
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: `${email}`,
      subject: "Groills | Verification code",
      react: EmailTemplate({ username, otp }),
    });

    return {
      success: true,
      message: "Email sent successfully",
    };
  } catch (error: unknown) {
  console.log("Error while sending email:", error);

  let errorMessage = "Unknown error";
  if (error instanceof Error) {
    errorMessage = error.message;
  }

  return {
    success: false,
    message: "Failed to send email",
    error: errorMessage,
  };
}

}
