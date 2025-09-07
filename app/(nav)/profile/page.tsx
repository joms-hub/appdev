export const runtime = "nodejs";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;

  return (
    <ProfileClient
      initialData={{
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        image: user.image || null,
      }}
    />
  );
}
