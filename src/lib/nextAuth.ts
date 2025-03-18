import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { connectDB } from "./db";
import User from "@/model/User";
import bcrypt from "bcryptjs";

export const authOption: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { type: "text", label: "Email" },
        password: { type: "text", label: "Email" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email or Password is required");
        }

        try {
          await connectDB();

          const existUser = await User.findOne({ email: credentials.email });

          if (!existUser) {
            throw new Error("not found");
          }

          const isvalid = await bcrypt.compare(
            credentials?.password,
            existUser.password
          );

          if (!isvalid) {
            throw new Error("password is not match");
          }

          return {
            id: existUser._id,
            email: existUser.email,
          };
        } catch (error) {
          throw error;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (token) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  pages: {
    error: "/login",
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.AUTH_SECRET,
};
