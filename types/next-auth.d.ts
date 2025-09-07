// types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      image?: string;
      firstName?: string;
      lastName?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    image?: string;
    firstName?: string;
    lastName?: string;
  }

  interface JWT {
    id?: string;
    onboardingCompleted?: boolean;
    lastOnboardingCheck?: number;
  }
}
