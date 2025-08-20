import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "Enter the email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter the password",
        },
      },
      async authorize(credentials: any): Promise<any> {
        try {
          await dbConnect();
          const user = await UserModel.findOne({
            email: credentials?.email,
          });
          if (!user) {
            return null;
          }
          if (!credentials?.password || !user?.password) {
            return null;
          }
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (!isValidPassword) {
            return null;
          }

          return user;
        } catch (error: any) {
          throw new Error("Error while signing user: ", error);
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      await dbConnect();
      if (token) {
        const dbUser = await UserModel.findById(token._id)
        session.user._id = token._id;
        session.user.isVerified = dbUser?.isVerified;
        session.user.username = dbUser?.username;
      }
      return session;
    },
    async jwt({ token, user }) {
      await dbConnect()
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.username = user.username;
      }

      return token;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
