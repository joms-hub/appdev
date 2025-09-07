"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-md border-2 px-5 py-1 text-white transition hover:bg-white hover:text-black"
    >
      Logout
    </button>
  );
}
