"use client";
import { verifyCodeSchema } from "@/schemas/verifyCodeSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPSlot } from "@/components/ui/input-otp";
import { motion } from "framer-motion";

function VerifyOTP() {
  const router = useRouter();
  const param = useParams();

  const username = param?.username
    ? param.username.toString().replace(/%20/g, " ")
    : "";
  console.log(username)
  // zod implementation
  const form = useForm({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: {
      verifyCode: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof verifyCodeSchema>) => {
    try {
      const response = await axios.post(`/api/verify-otp`, {
        username: username,
        verifyOTP: data.verifyCode,
      });
      if (!response.data.success) {
        toast.error("InValid Password", {
          description: response.data.message,
        });
      }
      toast.success("Verified Successfully");
      router.replace(`/sign-in`);
    } catch (error) {
      console.error(error);
      const axiosError = error as AxiosError;
      const errorMessage = (axiosError.response?.data as { message?: string })
        ?.message;
      toast.error("Error while verifing otp", {
        description: errorMessage,
      });
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-center items-center min-h-screen bg-neutral-950">
        <div className="w-full max-w-md p-8 bg-gray-800/40 space-y-8 bg-card rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6 text-foreground">
              Verify Your Account
            </h1>
            <p className="mb-4">
              Enter the verification code sent to your email
            </p>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className=" flex flex-col items-center justify-center space-y-6"
            >
              <FormField
                name="verifyCode"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center justify-center space-y-2">
                    <FormLabel className="text-center">
                      Verification code
                    </FormLabel>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTP>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="text-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-10 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-purple-500/20"
              >
                Verify
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </motion.div>
  );
}

export default VerifyOTP;
