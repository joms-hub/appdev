// import type { User as NextAuthUser } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true, // Required for Vercel deployments
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
        if (user && user.email) {
          console.log("🔐 New user login, setting up token for:", user.email);
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
          
          // For new sign-ins, check onboarding status with timeout protection
          try {
            const dbTimeout = new Promise<null>((_, reject) => 
              setTimeout(() => reject(new Error('Database timeout')), 2000)
            );
            
            const dbQuery = prisma.userPreferences.findUnique({
              where: { userId: user.id },
            });
            
            const userPreferences = await Promise.race([dbQuery, dbTimeout]);
            token.onboardingCompleted = !!userPreferences;
            token.lastOnboardingCheck = Date.now();
            
            console.log("🔐 Initial onboarding status set:", token.onboardingCompleted);
          } catch (error) {
            console.error("Error checking initial onboarding status:", error);
            // Default to false - user can complete onboarding if needed
            token.onboardingCompleted = false;
            token.lastOnboardingCheck = Date.now();
          }
        } 
        // For existing tokens, only check onboarding periodically
        else if (token.id) {
          const now = Date.now();
          const lastCheck = token.lastOnboardingCheck as number || 0;
          const tenMinutes = 10 * 60 * 1000; // Check every 10 minutes instead of 5
          
          // Only check if onboarding is incomplete OR it's been a while
          if (!token.onboardingCompleted || (now - lastCheck) > tenMinutes) {
            try {
              console.log("🔐 Periodic onboarding check for user:", token.id);
              
              const dbTimeout = new Promise<null>((_, reject) => 
                setTimeout(() => reject(new Error('Database timeout')), 2000)
              );
              
              const dbQuery = prisma.userPreferences.findUnique({
                where: { userId: token.id as string },
              });
              
              const userPreferences = await Promise.race([dbQuery, dbTimeout]);
              const wasCompleted = token.onboardingCompleted;
              token.onboardingCompleted = !!userPreferences;
              token.lastOnboardingCheck = now;
              
              if (!wasCompleted && token.onboardingCompleted) {
                console.log("🎉 Onboarding completed detected for user:", token.id);
              }
            } catch (error) {
              console.error("Error in periodic onboarding check:", error);
              // Keep existing status on error
              token.lastOnboardingCheck = now;
            }
          }
        }

        console.log("🔐 JWT Callback - Complete", { 
          tokenId: token.id, 
          onboarding: token.onboardingCompleted 
        });
        return token;
      } catch (error) {
        console.error("❌ JWT Callback Fatal Error:", error);
        // Return token as-is to prevent total auth failure
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
