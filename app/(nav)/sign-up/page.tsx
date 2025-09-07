"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

import AuthForm from "@/ui/AuthForm";
import FormInput from "@/ui/FormInput";
import { signUp } from "@/actions/auth/server"; // ✅ server action

const initialState: string | undefined = undefined;

export default function SignUp() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [, formAction] = useActionState(
    async (_prevState: string | undefined, formData: FormData) => {
      setIsSubmitting(true);

      const password = formData.get("password") as string;
      const confirmPassword = formData.get("confirmPassword") as string;

      if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
        setIsSubmitting(false);
        return "Passwords do not match.";
      }

      const result = await signUp(undefined, formData);

      if (result === "Success!") {
        toast.success("Account created! Logging in...");

        const email = formData.get("email") as string;
        const loginResult = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (loginResult?.ok) {
          router.push("/track-selection");
        } else {
          toast.error("Login failed after sign up.");
        }
      } else {
        toast.error(result || "Signup failed.");
      }

      setIsSubmitting(false);
      return result;
    },
    initialState
  );

  return (
    <AuthForm
      greet="Create your account"
      desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
      action={formAction}
      actionText={isSubmitting ? "Creating..." : "Sign Up"}
      red_desc="Already have an account?"
      red_link="/login"
      redirect="Sign in"
    >
      <div className="flex gap-4 *:w-full">
        <FormInput label="First Name" name="firstName" type="text" />
        <FormInput label="Last Name" name="lastName" type="text" />
      </div>
      <FormInput label="Email" name="email" type="email" />
      <FormInput label="Password" name="password" type="password" />
      <FormInput
        label="Confirm Password"
        name="confirmPassword"
        type="password"
      />
    </AuthForm>
  );
}