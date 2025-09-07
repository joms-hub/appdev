"use client";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react"; 

export default function AuthGoogle() {
  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Google sign-in failed:", error);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      className="block w-full cursor-pointer rounded-md border-2 py-2 text-center text-lg font-bold">
      <FcGoogle className="mr-2 inline-block" />
      Continue with Google
    </button>
  );
}
