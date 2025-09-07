import Link from "next/link";
import Features from "./ui/Features";
import HowItWorks from "./ui/HowIt-Works";
import Tracks from "./ui/Tracks";
import Faq from "./ui/Faq";
import UserActivity from "./ui/activity/UserActivity";

export default function Home() {
  const logged_in = process.env.LOGGED_IN === "true"; // Placeholder session variable
  return (
    <>
      <div className="flex h-screen flex-col justify-center gap-10 text-center">
        <div className="text-6xl font-bold">Your ultimate study buddy.</div>
        <div className="text-xl font-light">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </div>
        <div>
          <Link
            href={logged_in ? "/dashboard" : "/sign-up"}
            className="rounded-md bg-white px-13 py-4 text-xl font-bold text-black"
          >
            Get Started
          </Link>
        </div>
      </div>
      {process.env.LOGGED_IN !== "true" && (
        <>
          <Features />
          <HowItWorks />
          <Tracks />
          <Faq />
          <UserActivity />
        </>
      )}
    </>
  );
}
