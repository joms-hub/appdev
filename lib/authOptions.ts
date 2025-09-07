import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string;
        const password = credentials?.password as string;

        console.log("[auth] Authorize called with:", { email });

        if (!email || !password) {
          console.log("[auth] Missing email or password");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          console.log("[auth] User not found:", email);
          return null;
        }

        if (!user.password) {
          console.log("[auth] User has no password — maybe OAuth-only account");
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password);
        console.log("[auth] Password match:", isValid);

        if (!isValid) {
          console.log("[auth] Password mismatch");
          return null;
        }

        const safeUser = {
          id: user.id,
          email: user.email,
          name: user.name ?? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
          image: user.image ?? undefined,
        };

        console.log("[auth] Returning safe user for session:", safeUser);

        return safeUser;
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt", // Change to JWT for credentials provider
  },
  callbacks: {
    async signIn({ user, account }) {
      console.log("SIGNIN CALLBACK", user, account);
      
      // For credentials provider, ensure user exists in database
      if (account?.provider === "credentials" && user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email }
        });
        
        if (!dbUser) {
          console.log("[auth] User not found in database during signIn");
          return false;
        }
        
        // Update user object with database ID
        user.id = dbUser.id;
      }
      
      return true;
    },
    async jwt({ token, user }) {
      try {
        console.log("🔐 JWT Callback - Start", { hasUser: !!user, tokenId: token.id });
        
        // When user signs in, add their info to the token
        if (user) {
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
          
          // Fetch additional user data from database including onboarding status
          if (user.email) {
            try {
              const dbUser = await prisma.user.findUnique({
                where: { email: user.email },
                select: {
                  id: true,
                  email: true,
                  name: true,
                  firstName: true,
                  lastName: true,
                  image: true,
                  UserPreferences: true, // Include preferences to check onboarding
                },
              });
              
              if (dbUser) {
                token.id = dbUser.id;
                token.firstName = dbUser.firstName;
                token.lastName = dbUser.lastName;
                token.image = dbUser.image;
                token.onboardingCompleted = !!dbUser.UserPreferences; // Check if user has preferences
                token.lastOnboardingCheck = Date.now();
              }
            } catch (error) {
              console.error("Error fetching user data during sign in:", error);
              // Set safe defaults
              token.onboardingCompleted = false;
              token.lastOnboardingCheck = Date.now();
            }
          }
        }
        
        // Check onboarding status periodically (every 5 minutes) instead of every request
        // This reduces database load and prevents auth failures from cold connections
        if (token.id) {
          const now = Date.now();
          const lastCheck = token.lastOnboardingCheck as number || 0;
          const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
          
          // Only check if it's been more than 5 minutes since last check
          // OR if onboarding is not yet completed (check more frequently for completion)
          if (!token.onboardingCompleted || (now - lastCheck) > fiveMinutes) {
            try {
              console.log("🔐 Checking onboarding status for user:", token.id);
              const userPreferences = await prisma.userPreferences.findUnique({
                where: { userId: token.id as string },
              });
              
              const wasCompleted = token.onboardingCompleted;
              token.onboardingCompleted = !!userPreferences;
              token.lastOnboardingCheck = now;
              
              if (!wasCompleted && token.onboardingCompleted) {
                console.log("🎉 Onboarding completed detected for user:", token.id);
              }
            } catch (error) {
              console.error("❌ Error checking user preferences in JWT:", error);
              // Don't break the session, keep existing value and delay next check
              token.lastOnboardingCheck = now;
              // If this is a fresh token without onboarding status, assume not completed
              if (token.onboardingCompleted === undefined) {
                token.onboardingCompleted = false;
              }
            }
          }
        }
        
        return token;
      } catch (error) {
        console.error("Error in JWT callback:", error);
        // Return token as-is to prevent session from breaking
        return token;
      }
    },
    async session({ session, token }) {
      try {
        // Send properties to the client
        if (token && session.user) {
          session.user.id = token.id as string;
          session.user.name = token.name ?? undefined;
          session.user.firstName = token.firstName as string | undefined;
          session.user.lastName = token.lastName as string | undefined;
          session.user.image = token.image as string | undefined;
          session.user.email = token.email ?? session.user.email;
        }
        
        console.log("[auth] Session callback result:", session);
        return session;
      } catch (error) {
        console.error("Error in session callback:", error);
        // Return session as-is to prevent breaking
        return session;
      }
    },
  },
};
