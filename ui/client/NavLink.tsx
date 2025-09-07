"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink() {
  const pathname = usePathname();
  return ["home", "dashboard", "roadmap", "assessments", "playground"].map(
    (link, i) => (
      <Link
        key={i}
        href={link === "home" ? "/" : `/${link}`}
        className={`rounded-md px-3 py-1 capitalize transition-colors duration-300 ${
          pathname === `/${link === "home" ? "" : link}`
            ? "bg-white text-black"
            : "hover:bg-white hover:text-black"
        }`}
      >
        {link.replace("-", " ")}
      </Link>
    ),
  );
}
