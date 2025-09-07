import Link from "next/link";
import Image from "next/image";
import { FaUserCircle } from "react-icons/fa";
import NavLink from "./client/NavLink";
import NavProfilePicture from "./client/NavProfilePicture";
import LogoutButton from "@/app/(nav)/ui/LogoutButton";
import { auth } from "@/lib/auth";

export default async function Nav() {
  let session = null;
  let logged_in = false;

  try {
    session = await auth();
    logged_in = !!session?.user;
  } catch (error) {
    console.error("Auth error in Nav component:", error);
    // Fallback to not logged in state
    logged_in = false;
  }

  return (
    <nav
      className={`${
        logged_in ? "border-b-2 border-white bg-black" : ""
      } fixed z-50 flex w-full flex-wrap items-center justify-around py-8 *:font-bold`}
    >
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/favicon.ico"
          alt="DevMate Logo"
          width={25}
          height={25}
          className="h-auto w-7 rounded-full"
        />
        <span className="text-3xl">DevMate</span>
      </Link>

      <div className="flex flex-wrap items-center gap-10">
        {!logged_in ? (
          ["home", "features", "how-it-works", "tracks", "faq"].map(
            (link, i) => (
              <Link
                key={i}
                href={link === "home" ? "/" : `/#${link}`}
                className={`rounded-md px-3 py-1 ${link === "faq" ? "uppercase" : "capitalize"} hover:text-black" transition-colors duration-300 hover:bg-white hover:text-black`}
              >
                {link.replace("-", " ")}
              </Link>
            ),
          )
        ) : (
          <NavLink />
        )}
      </div>

      {logged_in ? (
        <div className="flex items-center gap-4">
          <Link href="/profile" className="transition-colors hover:opacity-80">
            <NavProfilePicture imageUrl={session?.user?.image} />
          </Link>
          <LogoutButton />
        </div>
      ) : (
        <Link href="/login" className="block rounded-md border-2 px-5 py-1">
          Login
        </Link>
      )}
    </nav>
  );
}
