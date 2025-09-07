"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import AuthForm from "@/ui/AuthForm";
import FormInput from "@/ui/FormInput";

// Initial state for useActionState (optional since we're not returning dynamic state)
const initialState: string | undefined = undefined;

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [, formAction] = useActionState(
    async (_prevState: string | undefined, formData: FormData) => {
      setIsSubmitting(true);

      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      // Validate input
      if (!email || !password) {
        toast.error("Please enter both email and password.");
        setIsSubmitting(false);
        return "Please enter both email and password.";
      }

      try {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false, // Handle redirect manually to show toast
        });

        if (result?.ok && !result?.error) {
          toast.success("Login successful! Redirecting...");
          // Use router.push since client-side Nav will detect session change
          setTimeout(() => {
            router.push("/dashboard");
          }, 4000);
        } else {
          // Handle different error types
          if (result?.error === "CredentialsSignin") {
            toast.error("Invalid email or password. Please try again.");
          } else if (result?.error) {
            toast.error(`Login failed: ${result.error}`);
          } else {
            toast.error("Login failed. Please try again.");
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") { console.error("Login error:", error); }
        toast.error("An unexpected error occurred. Please try again.");
      }

      setIsSubmitting(false);
      return undefined;
    },
    initialState
  );

  return (
    <AuthForm
      greet="Welcome back!"
      desc="Log in to your account to continue."
      action={formAction}
      actionText={isSubmitting ? "Logging in..." : "Login"}
      red_desc="Don't have an account?"
      red_link="/sign-up"
      redirect="Sign up"
    >
      <FormInput label="Email" name="email" type="email" />
      <FormInput label="Password" name="password" type="password" />
      
      {/* Forgot Password Link - positioned below password field */}
      <div className="text-right">
        <Link 
          href="/forgot-password" 
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          Forgot your password?
        </Link>
      </div>
    </AuthForm>
  );
}
