"use client";
import { useFormStatus } from "react-dom";
import AuthGoogle from "./AuthGoogle";
import Link from "next/link";

type FormAction = (formData: FormData) => void;

export default function AuthForm({
  greet, // greeting message
  desc, // description message
  action, // form action URL
  actionText, // text for the action button
  red_desc, // description for the redirect message
  red_link, // URL to redirect to
  redirect, // text for the redirect link
  children,
}: {
  greet: string;
  desc: string;
  action?: string | FormAction;
  actionText: string;
  red_desc: string;
  red_link: string;
  redirect: string;
  children?: React.ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <div className="mb-10 flex justify-center">
      <div className="justify-content flex w-[40vw] flex-col gap-6 rounded-xl border-1 bg-black p-20">
        <div>
          <h1 className="mb-3 text-3xl font-bold">{greet}</h1>
          <div>{desc}</div>
        </div>
        <AuthGoogle />
        <div className="text-center font-light uppercase">or</div>
        <form action={typeof action === "function" ? action : undefined}
         className="flex flex-col gap-4">
          {children}
          <button
            type="submit"
            className="w-full cursor-pointer rounded-md bg-white py-2 text-xl font-bold text-black active:bg-gray-400"
          >
            {pending ? "Processing..." : actionText}
          </button>
        </form>
        
        <div className="text-center">
          {red_desc}{" "}
          <Link href={red_link} className="text-blue-400">
            {redirect}
          </Link>
          !
        </div>
      </div>
    </div>
  );
}
